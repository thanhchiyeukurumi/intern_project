'use strict';

require("express-router-group");
const express = require("express");
const cookieParser = require("cookie-parser");
const { middlewares, auth, role } = require("../kernels/middlewares");
const { validate } = require("../kernels/validations");
const exampleController = require("../modules/examples/controllers/exampleController");
const authController = require("../modules/auth/controllers/authController");
const { registerValidation, loginValidation } = require("../modules/auth/validations/authValidation");
const passport = require("../configs/passport");
const languageController = require("../modules/language/controllers/languageController");
const { createLanguageValidation, updateLanguageValidation } = require("../modules/language/validations/languageValidation");
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

// Language Routes
router.group("/languages", (router) => {
  // Lấy tất cả ngôn ngữ
  router.get("/", languageController.getAllLanguages);
  // Lấy ngôn ngữ theo id
  router.get("/:id", languageController.getLanguageById);
  // Thêm ngôn ngữ mới
  router.post("/", auth.authenticateJWT, role.hasRole(["admin"]), validate(createLanguageValidation), languageController.createLanguage);
  // Cập nhật ngôn ngữ
  router.put("/:id", auth.authenticateJWT, role.hasRole(["admin"]), validate(updateLanguageValidation), languageController.updateLanguage);
  // Xóa ngôn ngữ
  router.delete("/:id", auth.authenticateJWT, role.hasRole(["admin"]), languageController.deleteLanguage);
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
