const postService = require('modules/post/services/postService');
const db = require('models');
const { Post, Category, User, PostCategory, Language, Comment, Sequelize } = db;
const { Op } = Sequelize;

// Mock các models để tránh gọi database thật
jest.mock('models', () => {
  const mockPost = {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findByPk: jest.fn(),
    increment: jest.fn()
  };

  const mockCategory = {
    findAll: jest.fn()
  };

  const mockUser = {
    id: 1,
    username: 'testuser'
  };

  const mockLanguage = {
    id: 1,
    name: 'Tiếng Việt',
    locale: 'vi'
  };

  const mockPostCategory = {
    bulkCreate: jest.fn(),
    destroy: jest.fn()
  };

  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
    finished: false
  };

  const mockSequelize = {
    Op: {
      like: 'like',
      or: 'or',
      ne: 'ne'
    }
  };

  return {
    Post: mockPost,
    Category: mockCategory,
    User: mockUser,
    PostCategory: mockPostCategory,
    Language: mockLanguage,
    Comment: {},
    Sequelize: mockSequelize,
    sequelize: {
      transaction: jest.fn().mockResolvedValue(mockTransaction)
    }
  };
});

describe('Post Service', () => {
  // Reset mocks sau mỗi test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPosts', () => {
    it('nên trả về danh sách bài viết với phân trang', async () => {
      // Arrange
      const mockPosts = [
        { id: 1, title: 'Bài viết 1', content: 'Nội dung 1' },
        { id: 2, title: 'Bài viết 2', content: 'Nội dung 2' }
      ];
      
      Post.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockPosts
      });

      // Act
      const result = await postService.getAllPosts({
        page: 1,
        limit: 10,
        orderBy: 'createdAt',
        order: 'DESC'
      });

      // Assert
      expect(Post.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0
      }));
      
      expect(result).toEqual({
        data: mockPosts,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      });
    });

    it('nên áp dụng tìm kiếm theo từ khóa', async () => {
      // Arrange
      const mockPosts = [{ id: 1, title: 'Bài viết về TDD', content: 'Nội dung' }];
      Post.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockPosts
      });

      // Act
      await postService.getAllPosts({
        search: 'TDD'
      });

      // Assert
      expect(Post.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          [Op.or]: expect.anything()
        }
      }));
    });
  });

  describe('getPostByIdOrSlug', () => {
    it('nên trả về bài viết khi tìm thấy ID', async () => {
      // Arrange
      const mockPost = { 
        id: 1, 
        title: 'Bài viết test', 
        content: 'Nội dung test',
        views: 10,
        increment: jest.fn() 
      };
      Post.findOne.mockResolvedValue(mockPost);

      // Act
      const result = await postService.getPostByIdOrSlug(1);

      // Assert
      expect(Post.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 1 }
      }));
      expect(result).toEqual(mockPost);
    });

    it('nên tăng lượt xem khi được yêu cầu', async () => {
      // Arrange
      const mockPost = { 
        id: 1, 
        title: 'Bài viết test', 
        views: 10,
        increment: jest.fn() 
      };
      Post.findOne.mockResolvedValue(mockPost);

      // Act
      const result = await postService.getPostByIdOrSlug(1, true);

      // Assert
      expect(mockPost.increment).toHaveBeenCalledWith('views', { by: 1 });
      expect(result.views).toBe(11);
    });

    it('nên ném lỗi 404 khi không tìm thấy bài viết', async () => {
      // Arrange
      Post.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(postService.getPostByIdOrSlug(999)).rejects.toThrow('Không tìm thấy bài viết');
      await expect(postService.getPostByIdOrSlug(999)).rejects.toHaveProperty('statusCode', 404);
    });
  });

  describe('createPost', () => {
    it('nên tạo bài viết mới thành công', async () => {
      // Arrange
      const postData = { 
        title: 'Bài viết mới', 
        content: 'Nội dung mới',
        description: 'Mô tả',
        language_id: 1,
        categories: [1, 2] 
      };
      const mockCreatedPost = { id: 1, ...postData, user_id: 1 };
      
      Post.findOne.mockResolvedValue(null); // Không tìm thấy bài viết trùng tiêu đề
      Category.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]); // Tìm thấy đủ danh mục
      Post.create.mockResolvedValue(mockCreatedPost);
      PostCategory.bulkCreate.mockResolvedValue([]);

      // Act
      const result = await postService.createPost(postData, 1);

      // Assert
      expect(Post.findOne).toHaveBeenCalled();
      expect(Category.findAll).toHaveBeenCalled();
      expect(Post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: postData.title,
          content: postData.content,
          user_id: 1
        }),
        expect.any(Object)
      );
      expect(PostCategory.bulkCreate).toHaveBeenCalled();
      expect(db.sequelize.transaction).toHaveBeenCalled();
    });

    it('nên ném lỗi 409 khi tiêu đề đã tồn tại', async () => {
      // Arrange
      const postData = { title: 'Bài viết trùng', content: 'Nội dung' };
      Post.findOne.mockResolvedValue({ id: 1, title: 'Bài viết trùng' });

      // Act & Assert
      await expect(postService.createPost(postData, 1)).rejects.toThrow('Tiêu đề đã tồn tại');
      await expect(postService.createPost(postData, 1)).rejects.toHaveProperty('statusCode', 409);
    });

    it('nên ném lỗi 404 khi danh mục không tồn tại', async () => {
      // Arrange
      const postData = { 
        title: 'Bài viết mới', 
        content: 'Nội dung',
        categories: [1, 2, 3] 
      };
      Post.findOne.mockResolvedValue(null);
      // Chỉ tìm thấy 2 danh mục thay vì 3
      Category.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      // Act & Assert
      await expect(postService.createPost(postData, 1)).rejects.toThrow('Một hoặc nhiều danh mục không tồn tại');
      await expect(postService.createPost(postData, 1)).rejects.toHaveProperty('statusCode', 404);
    });
  });

  describe('updatePost', () => {
    it('nên cập nhật bài viết thành công', async () => {
      // Arrange
      const id = 1;
      const updateData = { 
        title: 'Bài viết cập nhật', 
        content: 'Nội dung cập nhật',
        categories: [1, 2] 
      };
      const existingPost = { 
        id, 
        title: 'Bài viết cũ', 
        content: 'Nội dung cũ',
        update: jest.fn().mockImplementation(function(data) {
          Object.assign(this, data);
          return this;
        })
      };
      
      Post.findByPk.mockResolvedValue(existingPost);
      Post.findOne.mockResolvedValue(null); // Không tìm thấy bài viết trùng tiêu đề
      Category.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]); // Tìm thấy đủ danh mục
      PostCategory.destroy.mockResolvedValue(undefined);
      PostCategory.bulkCreate.mockResolvedValue([]);

      // Act
      const result = await postService.updatePost(id, updateData);

      // Assert
      expect(Post.findByPk).toHaveBeenCalledWith(id, expect.any(Object));
      expect(existingPost.update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: updateData.title,
          content: updateData.content
        }),
        expect.any(Object)
      );
      expect(PostCategory.destroy).toHaveBeenCalled();
      expect(PostCategory.bulkCreate).toHaveBeenCalled();
      expect(result.title).toBe(updateData.title);
    });

    it('nên ném lỗi 404 khi không tìm thấy bài viết', async () => {
      // Arrange
      Post.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(postService.updatePost(999, { title: 'Test' })).rejects.toThrow('Không tìm thấy bài viết');
      await expect(postService.updatePost(999, { title: 'Test' })).rejects.toHaveProperty('statusCode', 404);
    });
  });

  describe('deletePost', () => {
    it('nên xóa bài viết thành công', async () => {
      // Arrange
      const id = 1;
      const mockPost = { 
        id, 
        title: 'Bài viết xóa', 
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Post.findByPk.mockResolvedValue(mockPost);

      // Act & Assert
      await expect(postService.deletePost(id)).resolves.not.toThrow();
      expect(Post.findByPk).toHaveBeenCalledWith(id, expect.any(Object));
      expect(mockPost.destroy).toHaveBeenCalled();
    });

    it('nên ném lỗi 404 khi không tìm thấy bài viết', async () => {
      // Arrange
      Post.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(postService.deletePost(999)).rejects.toThrow('Không tìm thấy bài viết');
      await expect(postService.deletePost(999)).rejects.toHaveProperty('statusCode', 404);
    });
  });
}); 