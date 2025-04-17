const commentService = require('modules/comment/services/commentService');
const db = require('models');
const { Comment, User, Post } = db;
const { Op } = require('sequelize');

// Mock các models để tránh gọi database thật
jest.mock('models', () => {
  const mockComment = {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findByPk: jest.fn()
  };

  const mockUser = {
    findOne: jest.fn(),
    findByPk: jest.fn()
  };

  const mockPost = {
    findOne: jest.fn(),
    findByPk: jest.fn()
  };

  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
    finished: false
  };

  return {
    Comment: mockComment,
    User: mockUser,
    Post: mockPost,
    sequelize: {
      transaction: jest.fn().mockResolvedValue(mockTransaction)
    },
    Sequelize: {
      Op: {
        like: 'like',
        or: 'or',
        ne: 'ne'
      }
    }
  };
});

// Mock module sequelize và Op
jest.mock('sequelize', () => {
  const actualSequelize = jest.requireActual('sequelize');
  return {
    ...actualSequelize,
    Op: {
      like: 'like',
      or: 'or',
      ne: 'ne'
    }
  };
});

describe('Comment Service', () => {
  // Reset mocks sau mỗi test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCommentsByPostId', () => {
    it('nên trả về danh sách bình luận của bài viết', async () => {
      // Arrange
      const postId = 1;
      const mockComments = [
        { id: 1, content: 'Bình luận 1', user_id: 1, post_id: postId },
        { id: 2, content: 'Bình luận 2', user_id: 2, post_id: postId }
      ];
      
      Post.findByPk.mockResolvedValue({ id: postId, title: 'Bài viết test' });
      Comment.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockComments
      });

      // Act
      const result = await commentService.getCommentsByPostId(postId, {
        page: 1,
        limit: 10,
        orderBy: 'created_at',
        order: 'DESC'
      });

      // Assert
      expect(Post.findByPk).toHaveBeenCalledWith(postId);
      expect(Comment.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { post_id: postId },
        order: [['created_at', 'DESC']],
        limit: 10,
        offset: 0
      }));
      
      expect(result).toEqual({
        data: mockComments,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      });
    });

    it('nên ném lỗi 404 khi không tìm thấy bài viết', async () => {
      // Arrange
      const postId = 999;
      Post.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(commentService.getCommentsByPostId(postId)).rejects.toThrow('Không tìm thấy bài viết');
      await expect(commentService.getCommentsByPostId(postId)).rejects.toHaveProperty('statusCode', 404);
    });
  });

  describe('getCommentById', () => {
    it('nên trả về bình luận khi tìm thấy ID', async () => {
      // Arrange
      const commentId = 1;
      const mockComment = { 
        id: commentId, 
        content: 'Nội dung bình luận',
        user_id: 1,
        post_id: 1
      };
      
      Comment.findByPk.mockResolvedValue(mockComment);

      // Act
      const result = await commentService.getCommentById(commentId);

      // Assert
      expect(Comment.findByPk).toHaveBeenCalledWith(commentId, expect.any(Object));
      expect(result).toEqual(mockComment);
    });

    it('nên ném lỗi 404 khi không tìm thấy bình luận', async () => {
      // Arrange
      Comment.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(commentService.getCommentById(999)).rejects.toThrow('Không tìm thấy bình luận');
      await expect(commentService.getCommentById(999)).rejects.toHaveProperty('statusCode', 404);
    });
  });

  describe('createComment', () => {
    it('nên tạo bình luận mới thành công', async () => {
      // Arrange
      const userId = 1;
      const postId = 1;
      const commentData = { content: 'Nội dung bình luận mới' };
      const mockCreatedComment = { 
        id: 1, 
        ...commentData,
        user_id: userId,
        post_id: postId
      };
      
      Post.findByPk.mockResolvedValue({ id: postId, title: 'Bài viết test' });
      Comment.create.mockResolvedValue(mockCreatedComment);
      
      // Mock cho getCommentById được gọi bên trong createComment
      jest.spyOn(commentService, 'getCommentById').mockResolvedValue({
        ...mockCreatedComment,
        User: { id: userId, username: 'testuser' },
        Post: { id: postId, title: 'Bài viết test' }
      });

      // Act
      const result = await commentService.createComment(commentData, userId, postId);

      // Assert
      expect(Post.findByPk).toHaveBeenCalledWith(postId, expect.any(Object));
      expect(Comment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          content: commentData.content,
          user_id: userId,
          post_id: postId
        }),
        expect.any(Object)
      );
      expect(db.sequelize.transaction).toHaveBeenCalled();
      expect(commentService.getCommentById).toHaveBeenCalledWith(mockCreatedComment.id);
      expect(result).toHaveProperty('User');
      expect(result).toHaveProperty('Post');
    });

    it('nên ném lỗi 404 khi không tìm thấy bài viết', async () => {
      // Arrange
      const userId = 1;
      const postId = 999;
      const commentData = { content: 'Nội dung bình luận mới' };
      
      Post.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(commentService.createComment(commentData, userId, postId)).rejects.toThrow('Không tìm thấy bài viết');
      await expect(commentService.createComment(commentData, userId, postId)).rejects.toHaveProperty('statusCode', 404);
    });
  });

  describe('updateComment', () => {
    it('nên cập nhật bình luận thành công', async () => {
      // Arrange
      const commentId = 1;
      const userId = 1;
      const updateData = { content: 'Nội dung bình luận cập nhật' };
      const existingComment = { 
        id: commentId, 
        content: 'Nội dung bình luận cũ',
        user_id: userId,
        update: jest.fn().mockImplementation(function(data) {
          Object.assign(this, data);
          return this;
        })
      };
      
      Comment.findByPk.mockResolvedValue(existingComment);
      
      // Mock cho getCommentById được gọi bên trong updateComment
      jest.spyOn(commentService, 'getCommentById').mockResolvedValue({
        ...existingComment,
        content: updateData.content,
        User: { id: userId, username: 'testuser' },
        Post: { id: 1, title: 'Bài viết test' }
      });

      // Act
      const result = await commentService.updateComment(commentId, updateData, userId);

      // Assert
      expect(Comment.findByPk).toHaveBeenCalledWith(commentId, expect.any(Object));
      expect(existingComment.update).toHaveBeenCalledWith(updateData, expect.any(Object));
      expect(commentService.getCommentById).toHaveBeenCalledWith(commentId);
      expect(result.content).toBe(updateData.content);
    });

    it('nên ném lỗi 404 khi không tìm thấy bình luận', async () => {
      // Arrange
      Comment.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(commentService.updateComment(999, { content: 'Test' }, 1)).rejects.toThrow('Không tìm thấy bình luận');
      await expect(commentService.updateComment(999, { content: 'Test' }, 1)).rejects.toHaveProperty('statusCode', 404);
    });

    it('nên ném lỗi 403 khi người dùng không có quyền chỉnh sửa', async () => {
      // Arrange
      const commentId = 1;
      const userId = 2; // người dùng khác với người tạo bình luận
      const existingComment = { 
        id: commentId, 
        content: 'Nội dung bình luận',
        user_id: 1 // người dùng tạo bình luận
      };
      
      Comment.findByPk.mockResolvedValue(existingComment);

      // Act & Assert
      await expect(commentService.updateComment(commentId, { content: 'Test' }, userId)).rejects.toThrow('Bạn không có quyền chỉnh sửa bình luận này');
      await expect(commentService.updateComment(commentId, { content: 'Test' }, userId)).rejects.toHaveProperty('statusCode', 403);
    });
  });

  describe('deleteComment', () => {
    it('nên xóa bình luận thành công khi là chủ bình luận', async () => {
      // Arrange
      const commentId = 1;
      const userId = 1;
      const mockComment = { 
        id: commentId, 
        content: 'Nội dung bình luận',
        user_id: userId,
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Comment.findByPk.mockResolvedValue(mockComment);

      // Act
      const result = await commentService.deleteComment(commentId, userId);

      // Assert
      expect(Comment.findByPk).toHaveBeenCalledWith(commentId, expect.any(Object));
      expect(mockComment.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('nên xóa bình luận thành công khi là admin', async () => {
      // Arrange
      const commentId = 1;
      const userId = 2; // không phải chủ bình luận
      const isAdmin = true;
      const mockComment = { 
        id: commentId, 
        content: 'Nội dung bình luận',
        user_id: 1, // người dùng tạo bình luận
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Comment.findByPk.mockResolvedValue(mockComment);

      // Act
      const result = await commentService.deleteComment(commentId, userId, isAdmin);

      // Assert
      expect(Comment.findByPk).toHaveBeenCalledWith(commentId, expect.any(Object));
      expect(mockComment.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('nên ném lỗi 404 khi không tìm thấy bình luận', async () => {
      // Arrange
      Comment.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(commentService.deleteComment(999, 1)).rejects.toThrow('Không tìm thấy bình luận');
      await expect(commentService.deleteComment(999, 1)).rejects.toHaveProperty('statusCode', 404);
    });

    it('nên ném lỗi 403 khi người dùng không có quyền xóa', async () => {
      // Arrange
      const commentId = 1;
      const userId = 2; // không phải chủ bình luận
      const isAdmin = false; // không phải admin
      const mockComment = { 
        id: commentId, 
        content: 'Nội dung bình luận',
        user_id: 1 // người dùng tạo bình luận
      };
      
      Comment.findByPk.mockResolvedValue(mockComment);

      // Act & Assert
      await expect(commentService.deleteComment(commentId, userId, isAdmin)).rejects.toThrow('Bạn không có quyền xóa bình luận này');
      await expect(commentService.deleteComment(commentId, userId, isAdmin)).rejects.toHaveProperty('statusCode', 403);
    });
  });
}); 