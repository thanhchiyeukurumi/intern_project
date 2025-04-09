require("dotenv").config();
module.exports = {
    secret: process.env.JWT_SECRET || 'your_faking_jwt_secret_key',
    expiration: process.env.JWT_EXPIRATION || '30m',
    expirationRefresh: process.env.JWT_EXPIRATION_REFRESH || '30d',
    algorithm: 'HS256'
};


