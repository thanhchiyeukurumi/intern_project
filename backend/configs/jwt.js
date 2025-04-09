module.exports = {
    secret: process.env.JWT_SECRET || 'your_faking_jwt_secret_key',
    accessToken: {
        expiresIn: '15m',
        algorithm: 'HS256',
    },
    refreshToken: {
        expiresIn: '30d',
        algorithm: 'HS256',
    }
};
