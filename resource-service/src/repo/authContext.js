const authContext = ({ reqHeaders, serviceClient }) => {

    const userId = () => reqHeaders['x-user-id']

    const authToken = () => reqHeaders['x-auth-token'];

    const me = async () => {
        const { data, errors } = await serviceClient
            .withUser(authToken())
            .process(`query { me {id name} }`)

        if (errors) return null;
        return data.me;
    }

    const hasRole = async (role) => {
        const { data, errors } = await serviceClient
            .withUser(authToken())
            .process(`query { me {id hasRole(role: ${role})} }`)        

        if (errors || !data.me) return null;
        return data.me.hasRole;
    }

    return Object.create({
        me,
        userId, 
        hasRole
    })
}


module.exports = authContext;