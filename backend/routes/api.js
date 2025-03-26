'use strict';

require("express-router-group");
const express = require("express");
const middlewares = require("../kernels/middlewares");
const { validate } = require("../kernels/validations");
const exampleController = require("../modules/examples/controllers/exampleController");
const authController = require("../modules/auth/controllers/authController");
const { registerValidation, loginValidation } = require("../modules/auth/validations/authValidation");
const { auth } = require("../kernels/middlewares");
const passport = require("../configs/passport");
const router = express.Router({ mergeParams: true });
// const passport = require("passport");
// Khởi tạo passport
router.use(passport.initialize());

// Authentication Routes
router.group("/auth", (router) => {
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
