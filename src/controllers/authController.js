const User = require('../models/user');
const config = require('../config');

const createResponse = (success, message, data = null, statusCode = 200) => ({
    success,
    message,
    data,
    statusCode
});


const validateFields = (fields, data) => {
    for (let field of fields) {
        if (!data[field]) {
            throw new Error(`Please provide ${field}`);
        }
    }
};

const authController = {
    /*
    register: async (req, res, next) => {
        try {
            const { username, email, password, firstName, lastName } = req.body;

            validateFields(['username', 'email', 'password'], req.body);

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json(createResponse(false, 'User with this email already exists', null, 400));
            }

            const user = await User.create({ username, email, password, firstName, lastName });
            const token = await user.generateAuthToken();

            res.status(201).json(createResponse(true, 'User registered successfully', { user: user.toJSON(), token }, 201));
        } catch (error) {
            next(error);
        }
    },
    */
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;

            validateFields(['email', 'password'], req.body);

            const user = await User.findOne({ where: { email } });
            if (!user || !(await user.validPassword(password))) {
                return res.status(401).json(createResponse(false, 'Invalid credentials', null, 401));
            }

            const token = await user.generateAuthToken();

            res.status(200).json(createResponse(true, 'Login successful', {
                token,
                user: user.toJSON()
            }));
        } catch (error) {
            next(error);
        }
    },

    logout: async (req, res, next) => {
        try {
            await req.user.clearToken();
            res.json(createResponse(true, 'Logged out successfully'));
        } catch (error) {
            next(error);
        }
    }
};

module.exports = authController;