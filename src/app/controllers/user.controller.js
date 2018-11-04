const express = require('express');
const User = require('../models/user');
const utils =require('../../config/utils');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', async (req, res) => {
    const { email } = req.body;

    try {
        if (await User.findOne({ email }))
            return res.status(400).send({ error: 'User already exists' });
        const user = await User.create(req.body);

        user.password = undefined;

        return res.send({
            user,
            token: utils.generateToken(
                { id: user.id }
            )
        });

    } catch (err) {
        return res.status(400).send({ error: 'Registration failed' });
    }
});

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        return res.send({ users, userId:req.userId });
    } catch (err) {
        return res.status(400).send({ error: 'Get failed' });
    }

});

module.exports = app => app.use('/api/user', router);