
const authContext = ({ reqHeaders, userRepo }) => {

    const userId = () => reqHeaders['x-user-id']

    const me = async() => await userRepo.getUserById(userId());

    return Object.create({
        me,
        userId
    })
}


module.exports = authContext;