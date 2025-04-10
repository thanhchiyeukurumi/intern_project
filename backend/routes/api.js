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
const categoryController = require("../modules/category/controllers/categoryController");
const { createCategoryValidation, updateCategoryValidation } = require("../modules/category/validations/categoryValidation");
const userController = require("../modules/user/controllers/userController");
const { createUserValidation, updateUserValidation } = require("../modules/user/validations/userValidation");
const router = express.Router({ mergeParams: true });

/**
 * @description: Routes cho người dùng, có phân biệt mai sau admin sẽ làm những gì
 */


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

// Category Routes
router.group("/categories", (router) => {
  // Lấy tất cả danh mục
  router.get("/", categoryController.getAllCategories);
  // Lấy danh mục theo id
  router.get("/:id", categoryController.getCategoryById);
  // Thêm danh mục mới
  router.post("/", auth.authenticateJWT, role.hasRole(["admin"]), validate(createCategoryValidation), categoryController.createCategory);
  // Cập nhật danh mục
  router.put("/:id", auth.authenticateJWT, role.hasRole(["admin"]), validate(updateCategoryValidation), categoryController.updateCategory);
  // Xóa danh mục
  router.delete("/:id", auth.authenticateJWT, role.hasRole(["admin"]), categoryController.deleteCategory);
});

// User Profile Routes
router.group("/user", (router) => {
  // Lấy thông tin người dùng
  /**
   * @description: fix sau
   */
  router.get("/:id", userController.getUserById);
  router.get("/", userController.getAllUsers);
  // Cập nhật thông tin người dùng
  router.put("/:id", auth.authenticateJWT, role.isOwner(), userController.updateUser);
  // Xóa người dùng
  router.delete("/:id", auth.authenticateJWT, userController.deleteUser);
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
