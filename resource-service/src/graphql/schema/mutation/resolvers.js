const { AuthenticationError, ApolloError } = require('apollo-server');

const resolvers = {
    Mutation: {
        createItem: async (_, { item }, { itemRepo }) => {
            const result = await itemRepo.createItem(item);
            if(result) return result._id;
            return ""
        }
    }
}

module.exports = resolvers