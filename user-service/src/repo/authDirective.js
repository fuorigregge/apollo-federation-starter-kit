const authDirective = async (requiredRole, roleDefs, parent, params, { authContext, userRepo }) => {
    const userId = authContext.userId();
    if (requiredRole === roleDefs.USER) {
        return !!userId;
    }
    const user = await userRepo.getUserById(userId);
    return user.hasRole(requiredRole);
}


module.exports = authDirective;