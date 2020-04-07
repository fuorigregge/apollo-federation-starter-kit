const authDirective = async (requiredRole, roleDefs, parent, params, { authContext }) => {
    const userId = authContext.userId();
    if (requiredRole === roleDefs.USER) {
        return !!userId;
    }
    return authContext.hasRole(requiredRole);    
}


module.exports = authDirective;