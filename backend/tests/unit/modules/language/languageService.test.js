const languageService = require('modules/language/services/languageService');
const db = require('models');
const { Language, Post } = db;

// Mock các models để tránh gọi database thật
jest.mock('models', () => {
  const mockLanguage = {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  };  
  
  const mockPost = {
    count: jest.fn()
  };
  
  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
    finished: false
  };
  
  return {
    Language: mockLanguage,
    Post: mockPost,
    sequelize: {
      transaction: jest.fn().mockResolvedValue(mockTransaction)
    }
  };
});

describe('Language Service', () => {
  // Reset mocks sau mỗi test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllLanguages', () => {
    it('nên trả về danh sách ngôn ngữ với phân trang', async () => {
      // Arrange
      const mockLanguages = [
        { id: 1, name: 'Tiếng Việt', locale: 'vi' },
        { id: 2, name: 'English', locale: 'en' }
      ];
      
      Language.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockLanguages
      });

      // Act
      const result = await languageService.getAllLanguages({
        page: 1,
        limit: 10,
        orderBy: 'name',
        order: 'ASC'
      });

      // Assert
      expect(Language.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        order: [['name', 'ASC']],
        limit: 10,
        offset: 0
      }));
      
      expect(result).toEqual({
        data: mockLanguages,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      });
    });
  });

  describe('getLanguageById', () => {
    it('nên trả về ngôn ngữ khi tìm thấy ID', async () => {
      // Arrange
      const mockLanguage = { id: 1, name: 'Tiếng Việt', locale: 'vi' };
      Language.findByPk.mockResolvedValue(mockLanguage);

      // Act
      const result = await languageService.getLanguageById(1);

      // Assert
      expect(Language.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(result).toEqual(mockLanguage);
    });

    it('nên ném lỗi 404 khi không tìm thấy ID', async () => {
      // Arrange
      Language.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(languageService.getLanguageById(999)).rejects.toThrow('Không tìm thấy ngôn ngữ');
      await expect(languageService.getLanguageById(999)).rejects.toHaveProperty('statusCode', 404);
    });
  });

  describe('createLanguage', () => {
    it('nên tạo ngôn ngữ mới thành công', async () => {
      // Arrange
      const languageData = { name: 'Français', locale: 'fr', is_active: true };
      const mockCreatedLanguage = { id: 3, ...languageData };
      
      Language.findOne.mockResolvedValue(null); // Không tìm thấy ngôn ngữ trùng tên
      Language.create.mockResolvedValue(mockCreatedLanguage);

      // Act
      const result = await languageService.createLanguage(languageData);

      // Assert
      expect(Language.findOne).toHaveBeenCalled();
      expect(Language.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: languageData.name,
          locale: languageData.locale,
          is_active: languageData.is_active
        }),
        expect.any(Object)
      );
      expect(db.sequelize.transaction).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedLanguage);
    });

    it('nên ném lỗi 409 khi ngôn ngữ trùng tên', async () => {
      // Arrange
      const languageData = { name: 'Tiếng Việt', locale: 'vi' };
      Language.findOne.mockResolvedValue({ id: 1, name: 'Tiếng Việt', locale: 'vi' });

      // Act & Assert
      await expect(languageService.createLanguage(languageData)).rejects.toThrow('Tên ngôn ngữ đã tồn tại');
      await expect(languageService.createLanguage(languageData)).rejects.toHaveProperty('statusCode', 409);
    });
  });

  describe('updateLanguage', () => {
    it('nên cập nhật ngôn ngữ thành công', async () => {
      // Arrange
      const id = 1;
      const updateData = { name: 'Tiếng Việt Mới', locale: 'vi-VN' };
      const existingLanguage = { id, name: 'Tiếng Việt', locale: 'vi', update: jest.fn() };
      
      Language.findByPk.mockResolvedValue(existingLanguage);
      Language.findOne.mockResolvedValue(null); // Không tìm thấy ngôn ngữ trùng tên
      existingLanguage.update.mockResolvedValue({ id, ...updateData });

      // Act
      const result = await languageService.updateLanguage(id, updateData);

      // Assert
      expect(Language.findByPk).toHaveBeenCalledWith(id, expect.any(Object));
      expect(Language.findOne).toHaveBeenCalled();
      expect(existingLanguage.update).toHaveBeenCalledWith(updateData, expect.any(Object));
      expect(result).toEqual({ id, ...updateData });
    });

    it('nên ném lỗi 404 khi không tìm thấy ID', async () => {
      // Arrange
      Language.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(languageService.updateLanguage(999, { name: 'Test' })).rejects.toThrow('Không tìm thấy ngôn ngữ');
      await expect(languageService.updateLanguage(999, { name: 'Test' })).rejects.toHaveProperty('statusCode', 404);
    });

    it('nên ném lỗi 409 khi tên ngôn ngữ đã tồn tại', async () => {
      // Arrange
      const id = 1;
      const updateData = { name: 'English' };
      const existingLanguage = { id, name: 'Tiếng Việt', locale: 'vi' };
      const duplicateLanguage = { id: 2, name: 'English', locale: 'en' };
      
      Language.findByPk.mockResolvedValue(existingLanguage);
      Language.findOne.mockResolvedValue(duplicateLanguage);

      // Act & Assert
      await expect(languageService.updateLanguage(id, updateData)).rejects.toThrow('Tên ngôn ngữ đã tồn tại');
      await expect(languageService.updateLanguage(id, updateData)).rejects.toHaveProperty('statusCode', 409);
    });
  });

  describe('deleteLanguage', () => {
    it('nên xóa ngôn ngữ thành công', async () => {
      // Arrange
      const id = 1;
      const mockLanguage = { id, name: 'Tiếng Việt', locale: 'vi', destroy: jest.fn() };
      
      Language.findByPk.mockResolvedValue(mockLanguage);
      Post.count.mockResolvedValue(0); // Không có bài viết nào sử dụng ngôn ngữ này
      mockLanguage.destroy.mockResolvedValue(undefined);

      // Act
      await languageService.deleteLanguage(id);

      // Assert
      expect(Language.findByPk).toHaveBeenCalledWith(id, expect.any(Object));
      expect(Post.count).toHaveBeenCalledWith(expect.objectContaining({
        where: { language_id: id }
      }), expect.any(Object));
      expect(mockLanguage.destroy).toHaveBeenCalled();
    });

    it('nên ném lỗi 404 khi không tìm thấy ID', async () => {
      // Arrange
      Language.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(languageService.deleteLanguage(999)).rejects.toThrow('Không tìm thấy ngôn ngữ');
      await expect(languageService.deleteLanguage(999)).rejects.toHaveProperty('statusCode', 404);
    });

    it('nên ném lỗi 409 khi ngôn ngữ đang được sử dụng bởi bài viết', async () => {
      // Arrange
      const id = 1;
      const mockLanguage = { id, name: 'Tiếng Việt', locale: 'vi' };
      
      Language.findByPk.mockResolvedValue(mockLanguage);
      Post.count.mockResolvedValue(5); // Có 5 bài viết đang sử dụng ngôn ngữ này

      // Act & Assert
      await expect(languageService.deleteLanguage(id)).rejects.toThrow('Không thể xóa ngôn ngữ vì đang có bài viết sử dụng');
      await expect(languageService.deleteLanguage(id)).rejects.toHaveProperty('statusCode', 409);
    });
  });
}); 