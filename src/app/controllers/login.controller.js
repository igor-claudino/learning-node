const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const utils = require('../../config/utils');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');


const router = express.Router();

router.post('/', async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user)
        return res.status(400).send({ error: 'User not found' });
    if (!await bcrypt.compare(password, user.password)) {
        return res.status(400).send({ error: 'Invalid password' });
    }

    user.password = undefined;

    res.send({ user, token: utils.generateToken({ id: user.id }) });

});

router.post('/forgotPassword', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).send({ error: 'User not found' });

        const token = crypto.randomBytes(20).toString('hex');
        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findOneAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        });

        mailer.sendMail({
            to: email,
            from: 'test@mail.com',
            template: 'login/forgot_password',
            context: { token },
        }, err => {
            if (err)
                return res.status(400).send({ error: 'Cannot send forgot password email' });
            return res.send();
        })

    } catch (err) {
        res.status(400).send({ error: 'Error on forgot password, try again' });
    }
});

router.post('/resetPassword', async (req, res) => {
    const { email, token, password } = req.body;

    try {
        const user = await User.findOne({ email })
            .select('+passwordResetToken passwordResetExpires');
        if (!user)
            return res.status(400).send({ error: 'User not found' });

        if (token !== user.passwordResetToken)
            res.status(400).send({ error: 'Invalid Token' });

        const now = new Date();

        if (now > user.passwordResetExpires)
            res.status(400).send({ error: 'Token was expired. Generate a new one' });

        user.password = password;

        await user.save();

        res.send();

    } catch (err) {
        res.status(400).send({ error: 'Error on reset password, try again' });
    }
})

module.exports = app => app.use('/api/login', router);