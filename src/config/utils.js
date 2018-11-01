const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

module.exports = {
    generateToken: function (params = {}) {
        return jwt.sign(params, authConfig.secret, {
            expiresIn: 86400,
        })
    }
};