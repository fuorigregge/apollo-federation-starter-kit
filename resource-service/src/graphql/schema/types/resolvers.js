const resolvers = {
    Item: {
        user(item) {
            return { __typename: "User", id: item.user_id };
        }
    },
    User: {
        async items(user, _, { itemRepo }) {            
            return await itemRepo.getItemsByUserId(user.id)
        }
    }
};

module.exports = resolvers;