const jwt = require('jsonwebtoken');
const { TOKEN_EXPIRES_IN } = require('../constants');
const sha256 = require('sha256');
const bcrypt = require('bcrypt');
const { mongoId, randomString } = require('@ruzz/service-utils');

const userRepo = ({ userModel }) => {

    async function _hashPassword(password) {
        password = sha256(password);
        const salt = bcrypt.genSaltSync(10);
        return await bcrypt.hash(password, salt);
    }

    const getUserById = async id => await userModel.findOne({ _id: id })
    const getUserByUsername = async username => await userModel.findOne({ 'auth.username': username })
    const getUserByResetPasswordToken = async token => await userModel.findOne({ 'auth.resetPasswordToken': token });

    const register = (data) => {

        return new Promise((res, rej) => {
            _hashPassword(data.password.trim())
                .then(hashedPassword => {
                    const fullName = `${data.first_name.trim()} ${data.last_name.trim()}`;
                    const user = {
                        _id: mongoId(),
                        name: fullName,
                        email: data.email.toLowerCase().trim(),
                        profile: {
                            first_name: data.first_name.trim(),
                            last_name: data.last_name.trim(),
                        },
                        auth: {
                            username: data.email.trim(),
                            password: hashedPassword,
                            verified: false,
                            verificationToken: randomString(32),
                            attempts: 0
                        },
                        role: 'USER',
                        created_at: new Date()
                    };
                    try {
                        const model = new userModel(user);
                        res(model.save());
                    } catch (e) {
                        rej(e)
                    }
                });

        })
    };


    const login = async ({ username, password }) => {

        const user = await getUserByUsername(username);

        if (!user) {
            throw new Error("login_auth_deny");
        }

        if (user.is_locked) {
            await user.incLoginAttempts();
            throw new Error("user_locked_wait_5_min")
        }

        const result = await user.checkPassword(password);

        if (!result) {
            user.incLoginAttempts();
            throw new Error("login_auth_deny");
        }

        user.auth.attempts = 0;
        user.auth.lock_until = null;
        user.save();

        if (!user.auth.verified && !serviceSettings.debug) {
            throw new Error('login_auth_verify_account');
        }

        const payload = { userId: user._id };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: TOKEN_EXPIRES_IN,
            issuer: process.env.JWT_KEY,
            algorithm: process.env.JWT_ALGORITHM
        });

        return token;
    };


    const changePassword = (password, user) => {
        return new Promise((res, rej) => {
            _hashPassword(password.trim()).then(hashedPassword => {

                userModel.updateOne({ _id: user._id }, {
                    $set: { 'auth.password': hashedPassword },
                    $unset: { 'auth.resetPasswordToken': null }
                }, function (err, doc) {
                    if (err) {
                        rej(err)
                    }
                    res(doc)
                })

            });
        });
    };

    const verifyAccount = async (token) => {
        const user = await userModel.findOne({ 'auth.verificationToken': token }).exec();

        if (!user) {
            throw new Error("user_not_found")
        }

        userModel.updateOne({ _id: user._id }, {
            $set: { 'auth.verified': true },
            $unset: {
                'auth.verificationToken': null
            }
        }).exec();
        return user._id;
    };


    const forgotPassword = async (username) => {
        const user = await userModel.findOne({ 'auth.username': username }).exec();

        if (!user) {
            throw new Error('user_not_found');
        }

        user.auth.resetPasswordToken = randomString(32);

        await user.save();

        return user;
    };


    const refreshToken = (user) => {
        const payload = { userId: user._id };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: TOKEN_EXPIRES_IN, // seconds,
            issuer: process.env.JWT_KEY,
            algorithm: process.env.JWT_ALGORITHM
        });

        return token;
    }


    return Object.create({
        getUserById,
        getUserByUsername,
        getUserByResetPasswordToken,
        register,
        login,
        changePassword,
        refreshToken,
        forgotPassword,
        verifyAccount
    })
}

module.exports = userRepo;

