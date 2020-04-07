const resolvers = {

    User: {
        async __resolveReference(reference, { userRepo }) {
            return await userRepo.getUserById(reference.id)
        },
        async hasRole(user, {role}){            
            return user.hasRole(role);
        }
    }
};

module.exports = resolvers;