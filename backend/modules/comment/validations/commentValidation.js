const { body } = require('express-validator');
const db = require('models');
const { Post } = db;

const createCommentValidation = [
  // body('post_id')
  //   .notEmpty().withMessage('ID bài viết là bắt buộc')
  //   .isInt().withMessage('ID bài viết phải là số nguyên')
  //   .custom(async (postId) => {
  //     const post = await Post.findByPk(postId);
  //     if (!post) {
  //       throw new Error('Bài viết không tồn tại');
  //     }
  //     return true;
  //   }),
  
  body('content')
    .notEmpty().withMessage('Nội dung bình luận là bắt buộc')
    .isLength({ min: 1, max: 1000 }).withMessage('Nội dung bình luận phải từ 1-1000 ký tự')
];

const updateCommentValidation = [
  body('content')
    .notEmpty().withMessage('Nội dung bình luận là bắt buộc')
    .isLength({ min: 1, max: 1000 }).withMessage('Nội dung bình luận phải từ 1-1000 ký tự')
];

module.exports = {
  createCommentValidation,
  updateCommentValidation
}; 