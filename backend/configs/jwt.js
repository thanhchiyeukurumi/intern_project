module.exports = {
    secret: process.env.JWT_SECRET || 'your_faking_jwt_secret_key',
    expiration: process.env.JWT_EXPIRATION || '1d',
    options: {
        algorithm: 'HS256',
        expiresIn: process.env.JWT_EXPIRATION || '1d'
    }
};
