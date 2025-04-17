const categoryService = require('modules/category/services/categoryService');
const db = require('models');
const { Category, PostCategory } = db;
const { Op } = require('sequelize');

// Mock các models để tránh gọi database thật
jest.mock('models', () => {
  const mockCategory = {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findByPk: jest.fn()
  };

  const mockPostCategory = {
    count: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn()
  };

  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
    finished: false
  };

  return {
    Category: mockCategory,
    PostCategory: mockPostCategory,
    sequelize: {
      transaction: jest.fn().mockResolvedValue(mockTransaction)
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

describe('Category Service', () => {
  // Reset mocks sau mỗi test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('nên trả về danh sách danh mục với phân trang', async () => {
      // Arrange
      const mockCategories = [
        { id: 1, name: 'Frontend' },
        { id: 2, name: 'Backend' },
        { id: 3, name: 'DevOps' }
      ];
      
      Category.findAndCountAll.mockResolvedValue({
        count: 3,
        rows: mockCategories
      });

      // Act
      const result = await categoryService.getAllCategories({
        page: 1,
        limit: 3,
        orderBy: 'name',
        order: 'ASC'
      });

      // Assert
      expect(Category.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        order: [['name', 'ASC']],
        limit: 3,
        offset: 0,
        attributes: expect.any(Object)
      }));
      
      expect(result).toEqual({
        data: mockCategories,
        pagination: {
          total: 3,
          page: 1,
          limit: 3,
          totalPages: 1
        }
      });
    });

    it('nên áp dụng tìm kiếm theo tên danh mục', async () => {
      // Arrange
      const mockCategories = [{ id: 1, name: 'Frontend' }];
      Category.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockCategories
      });

      // Act
      await categoryService.getAllCategories({
        search: 'Front'
      });

      // Assert
      expect(Category.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          [Op.or]: expect.anything()
        }
      }));
    });
  });

  describe('getCategoryById', () => {
    it('nên trả về danh mục khi tìm thấy ID', async () => {
      // Arrange
      const mockCategory = { id: 1, name: 'Frontend' };
      Category.findByPk.mockResolvedValue(mockCategory);

      // Act
      const result = await categoryService.getCategoryById(1);

      // Assert
      expect(Category.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(result).toEqual(mockCategory);
    });

    it('nên ném lỗi 404 khi không tìm thấy danh mục', async () => {
      // Arrange
      Category.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(categoryService.getCategoryById(999)).rejects.toThrow('Không tìm thấy danh mục');
      await expect(categoryService.getCategoryById(999)).rejects.toHaveProperty('statusCode', 404);
    });
  });

  describe('createCategory', () => {
    it('nên tạo danh mục mới thành công', async () => {
      // Arrange
      const categoryData = { 
        name: 'New Category',
        parent_id: null
      };
      const mockCreatedCategory = { id: 4, ...categoryData };
      
      Category.findOne.mockResolvedValue(null); // Không tìm thấy danh mục trùng tên
      Category.create.mockResolvedValue(mockCreatedCategory);

      // Act
      const result = await categoryService.createCategory(categoryData);

      // Assert
      expect(Category.findOne).toHaveBeenCalled();
      expect(Category.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: categoryData.name,
          parent_id: categoryData.parent_id
        }),
        expect.any(Object)
      );
      expect(db.sequelize.transaction).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedCategory);
    });

    it('nên tạo danh mục con thành công', async () => {
      // Arrange
      const categoryData = { 
        name: 'Child Category',
        parent_id: 1
      };
      const mockCreatedCategory = { id: 5, ...categoryData };
      const mockParentCategory = { id: 1, name: 'Parent Category' };
      
      Category.findOne.mockResolvedValue(null); // Không tìm thấy danh mục trùng tên
      Category.findByPk.mockResolvedValue(mockParentCategory); // Tìm thấy danh mục cha
      Category.create.mockResolvedValue(mockCreatedCategory);

      // Act
      const result = await categoryService.createCategory(categoryData);

      // Assert
      expect(Category.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(Category.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: categoryData.name,
          parent_id: categoryData.parent_id
        }),
        expect.any(Object)
      );
      expect(result).toEqual(mockCreatedCategory);
    });

    it('nên ném lỗi 409 khi tên danh mục đã tồn tại', async () => {
      // Arrange
      const categoryData = { name: 'Existing Category' };
      Category.findOne.mockResolvedValue({ id: 1, name: 'Existing Category' });

      // Act & Assert
      await expect(categoryService.createCategory(categoryData)).rejects.toThrow('Danh mục đã tồn tại');
      await expect(categoryService.createCategory(categoryData)).rejects.toHaveProperty('statusCode', 409);
    });

    it('nên ném lỗi 404 khi danh mục cha không tồn tại', async () => {
      // Arrange
      const categoryData = { 
        name: 'New Category',
        parent_id: 999
      };
      
      Category.findOne.mockResolvedValue(null); // Không tìm thấy danh mục trùng tên
      Category.findByPk.mockResolvedValue(null); // Không tìm thấy danh mục cha

      // Act & Assert
      await expect(categoryService.createCategory(categoryData)).rejects.toThrow('Danh mục cha không tồn tại');
      await expect(categoryService.createCategory(categoryData)).rejects.toHaveProperty('statusCode', 404);
    });
  });

  describe('updateCategory', () => {
    it('nên cập nhật danh mục thành công', async () => {
      // Arrange
      const id = 1;
      const updateData = { 
        name: 'Updated Category',
        parent_id: null
      };
      const existingCategory = { 
        id, 
        name: 'Old Category',
        parent_id: null,
        update: jest.fn().mockImplementation(function(data) {
          Object.assign(this, data);
          return this;
        })
      };
      
      Category.findByPk.mockResolvedValue(existingCategory);
      Category.findOne.mockResolvedValue(null); // Không tìm thấy danh mục trùng tên

      // Act
      const result = await categoryService.updateCategory(id, updateData);

      // Assert
      expect(Category.findByPk).toHaveBeenCalledWith(id, expect.any(Object));
      expect(Category.findOne).toHaveBeenCalled();
      expect(existingCategory.update).toHaveBeenCalledWith(updateData, expect.any(Object));
      expect(result.name).toBe(updateData.name);
    });

    it('nên ném lỗi 404 khi không tìm thấy danh mục', async () => {
      // Arrange
      Category.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(categoryService.updateCategory(999, { name: 'Test' })).rejects.toThrow('Không tìm thấy danh mục');
      await expect(categoryService.updateCategory(999, { name: 'Test' })).rejects.toHaveProperty('statusCode', 404);
    });

    it('nên ném lỗi 409 khi tên danh mục đã tồn tại', async () => {
      // Arrange
      const id = 1;
      const updateData = { name: 'Existing Category' };
      const existingCategory = { id, name: 'Old Category' };
      const duplicateCategory = { id: 2, name: 'Existing Category' };
      
      Category.findByPk.mockResolvedValue(existingCategory);
      Category.findOne.mockResolvedValue(duplicateCategory);

      // Act & Assert
      await expect(categoryService.updateCategory(id, updateData)).rejects.toThrow('Tên danh mục đã tồn tại');
      await expect(categoryService.updateCategory(id, updateData)).rejects.toHaveProperty('statusCode', 409);
    });
  });

  describe('deleteCategory', () => {
    it('nên xóa danh mục thành công', async () => {
      // Arrange
      const id = 1;
      const mockCategory = { 
        id, 
        name: 'Category To Delete',
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Category.findByPk.mockResolvedValue(mockCategory);
      PostCategory.count.mockResolvedValue(0); // Không có bài viết nào sử dụng danh mục này
      Category.count.mockResolvedValue(0); // Không có danh mục con nào

      // Act & Assert
      await expect(categoryService.deleteCategory(id)).resolves.not.toThrow();
      expect(Category.findByPk).toHaveBeenCalledWith(id, expect.any(Object));
      expect(PostCategory.count).toHaveBeenCalled();
      expect(Category.count).toHaveBeenCalled();
      expect(mockCategory.destroy).toHaveBeenCalled();
    });

    it('nên ném lỗi 404 khi không tìm thấy danh mục', async () => {
      // Arrange
      Category.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(categoryService.deleteCategory(999)).rejects.toThrow('Không tìm thấy danh mục');
      await expect(categoryService.deleteCategory(999)).rejects.toHaveProperty('statusCode', 404);
    });

    it('nên ném lỗi 409 khi danh mục đang được sử dụng bởi bài viết', async () => {
      // Arrange
      const id = 1;
      const mockCategory = { id, name: 'Used Category' };
      
      Category.findByPk.mockResolvedValue(mockCategory);
      PostCategory.count.mockResolvedValue(5); // Có 5 bài viết đang sử dụng danh mục này

      // Act & Assert
      await expect(categoryService.deleteCategory(id)).rejects.toThrow('Không thể xóa danh mục vì đang có bài viết sử dụng');
      await expect(categoryService.deleteCategory(id)).rejects.toHaveProperty('statusCode', 409);
    });

    it('nên ném lỗi 409 khi danh mục có danh mục con', async () => {
      // Arrange
      const id = 1;
      const mockCategory = { id, name: 'Parent Category' };
      
      Category.findByPk.mockResolvedValue(mockCategory);
      PostCategory.count.mockResolvedValue(0); // Không có bài viết nào sử dụng danh mục này
      Category.count.mockResolvedValue(2); // Có 2 danh mục con

      // Act & Assert
      await expect(categoryService.deleteCategory(id)).rejects.toThrow('Không thể xóa danh mục vì có danh mục con');
      await expect(categoryService.deleteCategory(id)).rejects.toHaveProperty('statusCode', 409);
    });
  });
});

