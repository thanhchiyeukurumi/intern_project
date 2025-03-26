'use strict';

require("express-router-group");
const express = require("express");
const middlewares = require("kernels/middlewares");
const { validate } = require("kernels/validations");
const exampleController = require("modules/examples/controllers/exampleController");
const authRoutes = require("modules/auth/routes");
const passport = require("../configs/passport");
const router = express.Router({ mergeParams: true });
// const passport = require("passport");
// Khởi tạo passport
router.use(passport.initialize());

// Thêm Auth routes
router.use('/auth', authRoutes);

// ===== EXAMPLE Request, make this commented =====
// router.group("/posts",middlewares([authenticated, role("owner")]),(router) => {
//   router.post("/create",validate([createPostRequest]),postsController.create);
//   router.put("/update/:postId",validate([updatePostRequest]),postsController.update);
//   router.delete("/delete/:postId", postsController.destroy);
// }
// );

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
