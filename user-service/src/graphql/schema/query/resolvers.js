const resolvers = {
    Query: {
        me: async (_, __, { userRepo, authContext }) => {            
            return await userRepo.getUserById(authContext.userId())
        }
    }
};

module.exports = resolvers;