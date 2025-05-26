'use strict';

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        google_id: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: true,
            comment: 'Google OAuth ID'
        },
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            comment: 'Google OAuth ID'
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true,
                isCompanyEmail(value) {
                    if (!value.endsWith('@farmage.co.jp')) {
                        throw new Error('Only @farmage.co.jp emails are allowed');
                    }
                }
            }
        },
        profile_picture: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'URL to profile picture from Google'
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'regular',
            validate: {
                isIn: [['admin', 'regular']],
            },
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
            comment: 'Whether the user account is active'
        },
        access_token: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Google OAuth access token'
        },
        refresh_token: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Google OAuth refresh token'
        },
        token_expires_at: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'When the access token expires'
        },
        last_login_at: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Last login timestamp'
        }
    }, {
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['email']
            },
            {
                unique: true,
                fields: ['google_id']
            },
            {
                fields: ['role']
            },
            {
                fields: ['is_active']
            }
        ]
    });

    // Instance methods
    User.prototype.isAdmin = function () {
        return this.role === 'admin';
    };

    User.prototype.isActive = function () {
        return this.is_active === true;
    };

    User.prototype.updateLastLogin = async function () {
        this.last_login_at = new Date();
        await this.save();
    };

    User.prototype.deactivate = async function () {
        this.is_active = false;
        await this.save();
    };

    User.prototype.activate = async function () {
        this.is_active = true;
        await this.save();
    };

    // Class methods
    User.findByEmail = function (email) {
        return this.findOne({ where: { email } });
    };

    User.findByGoogleId = function (googleId) {
        return this.findOne({ where: { google_id: googleId } });
    };

    User.findActiveUsers = function () {
        return this.findAll({ where: { is_active: true } });
    };

    User.findAdmins = function () {
        return this.findAll({
            where: {
                role: 'admin',
                is_active: true
            }
        });
    };

    return User;
};