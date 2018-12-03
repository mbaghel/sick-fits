const Mutation = {
  async createItem(parent, args, ctx, info) {
    // TODO: check if they are logged in

    const item = await ctx.db.mutation.createItem(
      {
        data: {
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
    const item = await ctx.db.query.item({ where }, "{ id title }");
    // 2. Check if they own the item, or have permissions
    // TODO
    // 3. Delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  }
};

module.exports = Mutation;
