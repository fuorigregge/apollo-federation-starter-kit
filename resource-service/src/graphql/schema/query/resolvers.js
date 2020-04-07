const resolvers = {
    Query: {
        item: async (_, { id }, { itemRepo }) => await itemRepo.getItemById(id),
        items: async (_, __, { itemRepo }) => await itemRepo.getItems()
    }
};

module.exports = resolvers;