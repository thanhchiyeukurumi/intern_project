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
const postController = require("../modules/post/controllers/postController");
const { createPostValidation, updatePostValidation } = require("../modules/post/validations/postValidation");
const commentController = require("../modules/comment/controllers/commentController");
const { createCommentValidation, updateCommentValidation } = require("../modules/comment/validations/commentValidation");
const { isOwner } = require("kernels/middlewares/roleMiddlewares");
const router = express.Router({ mergeParams: true });

// Khởi tạo passport
router.use(passport.initialize());
// Sử dụng cookie-parser để đọc cookie
router.use(cookieParser());

/**
 * Authentication Routes
 * -----------------------------
 * @route   /auth
 * @access  Public (GET, POST)
 * @desc    Quản lý việc đăng ký, đăng nhập, đăng xuất, làm mới access token, xác thực token và Google OAuth
 *
 * POST    /auth/register            - Đăng ký tài khoản mới
 * POST    /auth/login               - Đăng nhập
 * POST    /auth/refresh-token       - Làm mới access token
 * POST    /auth/logout              - Đăng xuất
 * GET     /auth/me                  - Lấy thông tin người dùng hiện tại
 * GET     /auth/verify-token        - Xác thực token
 * GET     /auth/google              - Google OAuth
 * GET     /auth/google/callback     - Google OAuth callback
 */
router.group("/auth", (router) => {
  router.post('/register', validate(registerValidation), authController.register);
  router.post('/login', validate(loginValidation), authController.login);
  router.post('/refresh-token', authController.refreshToken);
  router.post('/logout', authController.logout);
  router.get('/me', auth.authenticateJWT, authController.getCurrentUser);
  router.get('/verify-token', auth.authenticateJWT, authController.verifyToken);
  router.get('/google', auth.authenticateGoogle);
  router.get('/google/callback', auth.googleCallback, authController.googleCallback);
});


/**
 * Language Routes
 * -----------------------------
 * @route   /languages
 * @access  Public (GET), Admin (POST, PUT, DELETE)
 * @desc    Quản lý ngôn ngữ hệ thống
 *
 * GET     /languages            - Lấy danh sách tất cả ngôn ngữ
 * GET     /languages/:id        - Lấy thông tin ngôn ngữ theo ID
 * POST    /languages            - Thêm mới ngôn ngữ (admin only)
 * PUT     /languages/:id        - Cập nhật ngôn ngữ (admin only)
 * DELETE  /languages/:id        - Xóa ngôn ngữ (admin only)
 */
router.group("/languages", (router) => {
  router.get("/", languageController.getAllLanguages);
  router.get("/:id", languageController.getLanguageById);
  router.post("/", auth.authenticateJWT, role.hasRole(["admin"]), validate(createLanguageValidation), languageController.createLanguage);
  router.put("/:id", auth.authenticateJWT, role.hasRole(["admin"]), validate(updateLanguageValidation), languageController.updateLanguage);
  router.delete("/:id", auth.authenticateJWT, role.hasRole(["admin"]), languageController.deleteLanguage);
}); 

/**
 * Category Routes
 * -----------------------------
 * @route   /categories
 * @access  Public (GET), Admin (POST, PUT, DELETE)
 * @desc    Quản lý danh mục bài viết
 *
 * GET     /categories            - Lấy tất cả danh mục
 * GET     /categories/:id        - Lấy danh mục theo id
 * POST    /categories            - Thêm danh mục mới (admin only)
 * PUT     /categories/:id        - Cập nhật danh mục (admin only)
 * DELETE  /categories/:id        - Xóa danh mục (admin only)
 */ 
router.group("/categories", (router) => {
  router.get("/", categoryController.getAllCategories);
  router.get("/:id", categoryController.getCategoryById);
  router.post("/", auth.authenticateJWT, role.hasRole(["admin"]), validate(createCategoryValidation), categoryController.createCategory);
  router.put("/:id", auth.authenticateJWT, role.hasRole(["admin"]), validate(updateCategoryValidation), categoryController.updateCategory);
  router.delete("/:id", auth.authenticateJWT, role.hasRole(["admin"]), categoryController.deleteCategory);
});

/**
 * User Profile Routes
 * -----------------------------
 * @route   /user
 * @access  Public (GET), User (PUT, DELETE), Admin (PUT, DELETE)
 * @desc    Quản lý thông tin người dùng
 *
 * GET     /user/:id            - Lấy thông tin người dùng theo id
 * GET     /user                - Lấy tất cả người dùng
 * PUT     /user/:id            - Cập nhật thông tin người dùng (admin only)
 * DELETE  /user/:id            - Xóa người dùng (admin only)
 */ 
router.group("/user", (router) => {
  router.get("/:id", userController.getUserById);
  router.get("/", userController.getAllUsers);
  router.put("/:id", auth.authenticateJWT, role.isAdminOrOwner(), userController.updateUser);
  router.delete("/:id", auth.authenticateJWT, role.isAdminOrOwner(), userController.deleteUser);
});

/**
 * Post Routes
 * -----------------------------
 * @route   /posts
 * @access  Public (GET), Admin (POST, PUT, DELETE)
 * @desc    Quản lý bài viết
 *
 * GET     /posts            - Lấy tất cả bài viết    
 * GET     /posts/search        - Tìm kiếm bài viết
 * GET     /posts/category/:categoryId    - Lấy bài viết theo danh mục
 * GET     /posts/:id            - Lấy bài viết theo id
 * POST    /posts            - Thêm bài viết (admin only)
 * PUT     /posts/:id        - Cập nhật bài viết (admin only)
 * DELETE  /posts/:id        - Xóa bài viết (admin only)
 * GET     /posts/user/:userId    - Lấy bài viết theo người dùng
 * GET     /posts/me            - Lấy bài viết của người dùng hiện tại
 * GET     /posts/:postId/comments    - Lấy tất cả bình luận của bài viết
 * POST    /posts/:postId/comments    - Thêm bình luận (user only)
 */ 
router.group("/posts", (router) => {
  router.get("/", postController.getAllPosts);
  router.get("/search", postController.searchPosts);
  router.get("/category/:categoryId", postController.getPostsByCategory);
  router.get("/:id", postController.getPostByIdOrSlug);
  router.post("/", auth.authenticateJWT, validate(createPostValidation), postController.createPost);
  router.put("/:id", auth.authenticateJWT, role.isAdminOrPostOwner(), validate(updatePostValidation), postController.updatePost);
  router.delete("/:id", auth.authenticateJWT, role.isAdminOrPostOwner(), postController.deletePost);
  router.get("/user/:userId", postController.getPostsByUser);
  router.get("/me", auth.authenticateJWT, postController.getPostsByUser);
  router.get("/:postId/comments", commentController.getCommentsByPostId);
  router.post("/:postId/comments", auth.authenticateJWT, validate(createCommentValidation), commentController.createComment);
});

/**
 * Comment Routes
 * -----------------------------
 * @route   /comments
 * @access  Public (GET), User (POST)
 * @desc    Quản lý bình luận
 *
 * GET     /comments/:id            - Lấy bình luận theo id
 * PUT     /comments/:id            - Cập nhật bình luận (admin only)
 * DELETE  /comments/:id            - Xóa bình luận (admin only)
 * GET     /comments/user/:userId    - Lấy bình luận theo người dùng
 * GET     /comments/me            - Lấy bình luận của người dùng hiện tại
 */ 
router.group("/comments", (router) => {
  router.get("/:id", commentController.getCommentById);
  router.put("/:id", auth.authenticateJWT, role.isAdminOrCommentOwner(), validate(updateCommentValidation), commentController.updateComment);
  router.delete("/:id", auth.authenticateJWT, role.isAdminOrCommentOwner(), commentController.deleteComment);
  router.get("/user/:userId", commentController.getCommentsByUserId);
  router.get("/me", auth.authenticateJWT, commentController.getCommentsByUserId);
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
