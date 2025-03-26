const express = require('express');
const router = express.Router();
const authController = require('./controllers/authController');
const { registerValidation, loginValidation } = require('./validations/authValidation');
const { auth } = require('kernels/middlewares');
const { validate } = require('kernels/validations');

// Đăng ký tài khoản mới
router.post('/register', validate(registerValidation), authController.register);

// Đăng nhập
router.post('/login', validate(loginValidation), authController.login);

// Lấy thông tin người dùng hiện tại
router.get('/me', auth.authenticateJWT, authController.getCurrentUser);

// Xác thực token
router.get('/verify-token', auth.authenticateJWT, authController.verifyToken);

// Routes cho Google OAuth
router.get('/google', auth.authenticateGoogle);
router.get('/google/callback', auth.googleCallback, authController.googleCallback);

// Routes cho GitHub OAuth
router.get('/github', auth.authenticateGithub);
router.get('/github/callback', auth.githubCallback, authController.githubCallback);

module.exports = router; 