
const { AuthenticationError, ApolloError } = require('apollo-server');

const resolvers = {
    Mutation: {
        login: async (_, params, { userRepo }) => {
            try {
                const token = await userRepo.login(params);
                return { token: token };
            } catch (e) {
                throw new AuthenticationError(e);
            }
        },
        createAccount: async (_, { user }, { userRepo }) => {
            const sameEmailUser = await userRepo.getUserByUsername(user.email);
            if (sameEmailUser) {
                throw new ApolloError("validation_email_notUnique", 422);
            }
            const doc = await userRepo.register(user);
            return doc._id
        },
        verifyAccount: async (_, { token }, { userRepo }) => {
            try {
                return await userRepo.verifyAccount(token);
            } catch (e) {
                throw new ApolloError(e, 422);
            }
        },
        forgotPassword: async (_, { username }, { userRepo }) => {
            try {
                const user = await userRepo.forgotPassword(username);
                return { token: user.auth.resetPasswordToken };
            } catch (e) {
                throw new ApolloError(e, 422);
            }
        },
        //check
        refreshToken: async (_, params, { authContext, userRepo }) => {
            const token = userRepo.refreshToken(authContext.me());
            return { token: token };
        },
        resetPassword: async (_, { resetToken, password }, { userRepo }) => {
            const user = await userRepo.getUserByResetPasswordToken(resetToken);
            if (!user) throw new ApolloError("user_not_found", 422);
            try {
                const result = await userRepo.changePassword(password, user);
                return result ? "1" : "0";
            } catch (e) {
                throw new ApolloError(e, 422);
            }
        }

    }
};

module.exports = resolvers;