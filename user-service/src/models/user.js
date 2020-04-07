const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const sha256 = require('sha256');
const { LOCK_TIME, MAX_LOGIN_ATTEMPTS, ROLES } = require('../constants')


const { Schema } = mongoose;

const UserSchema = new Schema({
    _id: String,
    name: String,    
    email: { type: String, lowercase: true, trim: true },
    profile: {
        first_name: String,
        last_name: String,
        display_name: String,
    },
    auth: {
        username: { type: String, lowercase: true, trim: true },
        password: String,
        attempts: Number,
        lock_until: Date,
        verified: Boolean,
        verificationToken: String,
        resetPasswordToken: String,
    },
    role: { type: String, default: "USER" },
    created_at: { type: Date, default: Date.now }
});

UserSchema.virtual('is_locked').get(function () {
    // check for a future lock_until timestamp
    return !!(this.auth.lock_until && this.auth.lock_until > Date.now());
});


UserSchema.methods.incLoginAttempts = async function () {
    if (this.auth.lock_until && this.auth.lock_until < Date.now()) {
        return await this.update({
            $set: { "auth.attempts": 1 },
            $unset: { "auth.lock_until": 1 }
        });
    }
    let updates = { $inc: { "auth.attempts": 1 } };
    if (this.auth.attempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.auth.is_locked) {
        updates.$set = { "auth.lock_until": Date.now() + LOCK_TIME };
    }
    return await this.update(updates);
};

UserSchema.methods.checkPassword = async function  (password) {    
    password = sha256(password);
    const match = await bcrypt.compare(password, this.auth.password);
    return !!match;
}

UserSchema.methods.hasRole = function(role, roles) {
    if(this.role === ROLES.ADMIN) return true;    
    return this.role === role;
}

const User = mongoose.model('User', UserSchema);

module.exports = User;