const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { ROLES } = require('../utils/constants');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 50]
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: [8, 255]
        }
    },
    firstName: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    lastName: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM(...Object.values(ROLES)),
        defaultValue: ROLES.EMPLOYEE,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    token: {
        type: DataTypes.STRING(500),
        allowNull: true
    }
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await User.hashPassword(user.password);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed(process.env.ADMIN_PASSWORD)) {
                user.password = await User.hashPassword(user.password);
            }
        }
    }
});

User.hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
};

User.prototype.generateAuthToken = async function() {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const token = jwt.sign(
        { id: this.id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    this.token = token;
    await this.save();
    return token;
};

User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    delete values.token;
    delete values.createdAt;
    delete values.updatedAt;
    return values;

};

User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

User.prototype.clearToken = async function() {
    this.token = null;
    return await this.save();
};



module.exports = User;