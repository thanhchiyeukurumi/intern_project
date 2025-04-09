'use strict';

require("express-router-group");
const express = require("express");
const cookieParser = require("cookie-parser");
const { middlewares, auth } = require("../kernels/middlewares");
const { validate } = require("../kernels/validations");
const exampleController = require("../modules/examples/controllers/exampleController");
const authController = require("../modules/auth/controllers/authController");
const { registerValidation, loginValidation } = require("../modules/auth/validations/authValidation");
const passport = require("../configs/passport");
const router = express.Router({ mergeParams: true });
// Khởi tạo passport
router.use(passport.initialize());
// Sử dụng cookie-parser để đọc cookie
router.use(cookieParser());

// Authentication Routes
router.group("/auth", (router) => {
  // Đăng ký tài khoản mới
  router.post('/register', validate(registerValidation), authController.register);
  // Đăng nhập
  router.post('/login', validate(loginValidation), authController.login);
  // Làm mới access token
  router.post('/refresh-token', authController.refreshToken);
  // Đăng xuất
  router.post('/logout', authController.logout);
  // Lấy thông tin người dùng hiện tại
  router.get('/me', auth.authenticateJWT, authController.getCurrentUser);
  // Xác thực token
  router.get('/verify-token', auth.authenticateJWT, authController.verifyToken);
  // Routes cho Google OAuth
  router.get('/google', auth.authenticateGoogle);
  router.get('/google/callback', auth.googleCallback, authController.googleCallback);
});

router.group("/example", validate([]), (router) => {
  router.get('/', exampleController.exampleRequest)
})

// Route mặc định
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Welcome to Blog API'
    },
    status: 200,
    message: 'API is running'
  });
});

module.exports = router;
