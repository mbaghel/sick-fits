const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transport, makeANiceEmail } = require("../mail");
const { hasPermission } = require("../utils");
const stripe = require("../stripe");

const Mutation = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to do that!");
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          // This creates a relationship between item and user
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
          ...args
        }
      },
      info
    );

    return item;
  },

  updateItem(parent, args, ctx, info) {
    //make copy of updates
    const updates = { ...args };
    // remove ID from update
    delete updates.id;
    // run update method
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1. find item
    const item = await ctx.db.query.item({ where }, "{ id title user {id} }");
    // 2. Check if they own the item, or have permissions
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ["ADMIN", "ITEMDELETE"].includes(permission)
    );
    if (!ownsItem && !hasPermissions) {
      throw new Error("You don't have permission to do that!");
    }
    // 3. Delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  },

  async signup(parent, args, ctx, info) {
    // set emails to lowercase (so it'll always match when they login)
    args.email = args.email.toLowerCase();
    // hash their password
    const password = await bcrypt.hash(args.password, 10);
    // create user in database
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ["USER"] }
        }
      },
      info
    );
    // create JWT token for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // set jwt as cookie on the response
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });
    // return user to the browser
    return user;
  },

  async signin(parent, { email, password }, ctx, info) {
    // 1. check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    // 2. check if password is correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid Password!");
    }
    // 3. generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // 4. set the cookie with the token
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });
    // 5. return the user
    return user;
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return { message: "Goodbye!" };
  },

  async requestReset(parent, args, ctx, info) {
    // 1. check if a real user
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No such user found for email ${args.email}`);
    }
    // 2. set a reset token and expiry on user
    const resetToken = (await promisify(randomBytes)(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hr from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });
    // 3. email them the reset token
    const mailRes = await transport.sendMail({
      from: "michael@michaelbaghel.com",
      to: user.email,
      subject: "Your Password Reset Token",
      html: makeANiceEmail(`
        Your password reset token is here: 
        \n\n
        <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">
          Click Here to Reset
        </a>
      `)
    });
    // 4. return the message
    return { message: "Thanks!" };
  },

  async resetPassword(parent, args, ctx, info) {
    // 1. check if passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error("Passwords do not match");
    }
    // 2. check if its a legit reset token
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now()
      }
    });
    if (!user) {
      throw new Error("Token either invalid or expired");
    }
    // 4. hash the new password
    const password = await bcrypt.hash(args.password, 10);
    // 5. save new password to user and delete reset token
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { id: user.id },
      data: { password, resetToken: null, resetTokenExpiry: null }
    });
    // 6. generate JWT token
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    // 7. set the cookie with the token
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });
    // 8. return the user
    console.log(updatedUser);
    return updatedUser;
  },

  async updatePermissions(parent, args, ctx, info) {
    // 1. Check if they are logged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in!");
    }
    // 2. Query the current user
    const currentUser = await ctx.db.query.user(
      { where: { id: ctx.request.userId } },
      info
    );
    // 3. Check if they have permissions to do this
    hasPermission(currentUser, ["ADMIN", "PERMISSIONUPDATE"]);
    // 4. Update the permissions
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions
          }
        },
        where: {
          id: args.userId
        }
      },
      info
    );
  },

  async addToCart(parent, args, ctx, info) {
    // 1. Check if they are logged in
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error("You must be logged in!");
    }
    // 2. Check their cart for the item
    const [existingCartItem] = await ctx.db.query.cartItems(
      {
        where: {
          item: { id: args.id },
          user: { id: userId }
        }
      },
      info
    );
    // 3. If already in cart update quantity by one
    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 }
        },
        info
      );
    }
    // 4. Otherwise add new item to cart
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId }
          },
          item: {
            connect: { id: args.id }
          }
        }
      },
      info
    );
  },

  async removeFromCart(parent, args, ctx, info) {
    // 1. Find the cart item
    const cartItem = await ctx.db.query.cartItem(
      { where: { id: args.id } },
      `{ id, user { id }}`
    );
    // 1.5 Make sure item exists
    if (!cartItem) throw new Error("No cart item found");
    // 2. Make sure they own it
    if (cartItem.user.id !== ctx.request.userId)
      throw new Error("What you tryin to pull here?");
    // 3. Delete that item
    return ctx.db.mutation.deleteCartItem({ where: { id: args.id } }, info);
  },

  async createOrder(parent, args, ctx, info) {
    // 1. Check user is logged in
    const { userId } = ctx.request;
    if (!userId) throw new Error("You must be signed in to do that!");
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `
      {id
      name
      email
      cart {
        id
        quantity
        item {
          id
          title
          price
          description
          image
          largeImage
        }
      }}
    `
    );
    // 2. Recalculate total price of order
    const amount = user.cart.reduce(
      (tally, cartItem) => tally + cartItem.quantity * cartItem.item.price,
      0
    );
    console.log(`${user.name} charged ${amount}`);
    // 3. Create Stripe charge
    const charge = await stripe.charges.create({
      amount,
      currency: "USD",
      source: args.token
    });
    // 4. Convert cart items to order items
    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: user.id } }
      };
      delete orderItem.id;
      return orderItem;
    });
    // 5. Create the order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        user: user.id,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: user.id } }
      }
    });
    // 6. Clear the user's cart, delete cartItems
    const cartItemIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: { id_in: cartItemIds }
    });
    // 7. Return the order to the client
    return order;
  }
};

module.exports = Mutation;
