const { forwardTo } = require("prisma-binding");
const { hasPermission } = require("../utils");

const Query = {
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  me(parent, args, ctx, info) {
    // check if there is a current user ID
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info
    );
  },
  async users(parent, args, ctx, info) {
    // 1. check if user logged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in");
    }
    // 2. check if the user has permissions to make the query
    hasPermission(ctx.request.user, ["ADMIN", "PERMISSIONUPDATE"]);
    // 3. query all  users
    return ctx.db.query.users({}, info);
  },
  async order(parent, args, ctx, info) {
    // 1. Check theyre logged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in");
    }
    // 2. Query the order
    const order = await ctx.db.query.order({ where: { id: args.id } }, info);
    // 3. Make sure they have permission to view order
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissionToSee = ctx.request.user.permissions.includes("ADMIN");
    if (!ownsOrder && !hasPermissionToSee) {
      throw new Error("You can't see this");
    }
    // 4. Return the order
    return order;
  },
  async orders(parent, args, ctx, info) {
    // 1. Check they are logged in
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error("You must be logged in");
    }
    // 2. Get their orders
    return ctx.db.query.orders(
      {
        where: { user: { id: userId } },
        orderBy: "createdAt_DESC"
      },
      info
    );
  }
};

module.exports = Query;
