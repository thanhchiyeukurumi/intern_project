const { createPostValidation, updatePostValidation } = require('modules/post/validations/postValidation');
const { validationResult } = require('express-validator');
const httpMocks = require('node-mocks-http');

// Mock cho các model
jest.mock('models', () => {
  return {
    Category: {
      findOne: jest.fn().mockImplementation(function(query) {
        const mockCategories = {
          1: { id: 1, name: 'Frontend' },
          2: { id: 2, name: 'Backend' }
        };
        
        if (query && query.where && query.where.id) {
          const id = query.where.id;
          return Promise.resolve(mockCategories[id] || null);
        }
        return Promise.resolve(null);
      })
    },
    Language: {
      findOne: jest.fn().mockImplementation(function(query) {
        const mockLanguages = {
          1: { id: 1, name: 'Tiếng Việt', locale: 'vi' },
          2: { id: 2, name: 'English', locale: 'en' }
        };
        
        if (query && query.where && query.where.id) {
          const id = query.where.id;
          return Promise.resolve(mockLanguages[id] || null);
        }
        return Promise.resolve(null);
      })
    }
  };
});

// Helper function để chạy validation
const runValidation = async (validationRules, reqBody) => {
  const req = httpMocks.createRequest({
    method: 'POST',
    body: reqBody
  });
  
  // Chạy tất cả các validation rules
  for (const validation of validationRules) {
    await validation.run(req);
  }
  
  return validationResult(req);
};

describe('Post Validation', () => {
  describe('createPostValidation', () => {
    it('nên thông qua khi dữ liệu hợp lệ', async () => {
      // Arrange
      const validData = {
        title: 'Tiêu đề bài viết test',
        content: 'Nội dung bài viết đủ dài để qua validation',
        description: 'Mô tả ngắn về bài viết',
        language_id: 1,
        categories: [1, 2]
      };
      
      // Act
      const result = await runValidation(createPostValidation, validData);
      
      // Assert
      expect(result.isEmpty()).toBe(true);
    });
    
    it('nên báo lỗi khi thiếu tiêu đề', async () => {
      // Arrange
      const invalidData = {
        content: 'Nội dung bài viết đủ dài để qua validation',
        description: 'Mô tả ngắn về bài viết',
        language_id: 1,
        categories: [1, 2]
      };
      
      // Act
      const result = await runValidation(createPostValidation, invalidData);
      
      // Assert
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].path).toBe('title');
    });
    
    it('nên báo lỗi khi tiêu đề quá ngắn', async () => {
      // Arrange
      const invalidData = {
        title: 'Test', // Chỉ 4 ký tự, yêu cầu ít nhất 5
        content: 'Nội dung bài viết đủ dài để qua validation',
        description: 'Mô tả ngắn về bài viết',
        language_id: 1,
        categories: [1, 2]
      };
      
      // Act
      const result = await runValidation(createPostValidation, invalidData);
      
      // Assert
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].path).toBe('title');
    });
    
    it('nên báo lỗi khi nội dung quá ngắn', async () => {
      // Arrange
      const invalidData = {
        title: 'Tiêu đề bài viết test',
        content: 'Ngắn', // Không đủ 10 ký tự
        description: 'Mô tả ngắn về bài viết',
        language_id: 1,
        categories: [1, 2]
      };
      
      // Act
      const result = await runValidation(createPostValidation, invalidData);
      
      // Assert
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].path).toBe('content');
    });
    
    it('nên báo lỗi khi mô tả quá ngắn', async () => {
      // Arrange
      const invalidData = {
        title: 'Tiêu đề bài viết test',
        content: 'Nội dung bài viết đủ dài để qua validation',
        description: 'Ngắn', // Không đủ 10 ký tự
        language_id: 1,
        categories: [1, 2]
      };
      
      // Act
      const result = await runValidation(createPostValidation, invalidData);
      
      // Assert
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].path).toBe('description');
    });
    
    it('nên báo lỗi khi thiếu language_id', async () => {
      // Arrange
      const invalidData = {
        title: 'Tiêu đề bài viết test',
        content: 'Nội dung bài viết đủ dài để qua validation',
        description: 'Mô tả ngắn về bài viết',
        categories: [1, 2]
      };
      
      // Act
      const result = await runValidation(createPostValidation, invalidData);
      
      // Assert
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].path).toBe('language_id');
    });
    
    it('nên báo lỗi khi thiếu categories', async () => {
      // Arrange
      const invalidData = {
        title: 'Tiêu đề bài viết test',
        content: 'Nội dung bài viết đủ dài để qua validation',
        description: 'Mô tả ngắn về bài viết',
        language_id: 1
      };
      
      // Act
      const result = await runValidation(createPostValidation, invalidData);
      
      // Assert
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].path).toBe('categories');
    });
  });
  
  describe('updatePostValidation', () => {
    it('nên thông qua khi dữ liệu hợp lệ', async () => {
      // Arrange
      const validData = {
        title: 'Tiêu đề bài viết cập nhật',
        content: 'Nội dung bài viết cập nhật đủ dài để qua validation',
        description: 'Mô tả mới về bài viết',
        language_id: 2,
        categories: [2]
      };
      
      // Act
      const result = await runValidation(updatePostValidation, validData);
      
      // Assert
      expect(result.isEmpty()).toBe(true);
    });
    
    it('nên thông qua khi chỉ cập nhật một số trường', async () => {
      // Arrange
      const partialData = {
        title: 'Tiêu đề bài viết cập nhật'
      };
      
      // Act
      const result = await runValidation(updatePostValidation, partialData);
      
      // Assert
      expect(result.isEmpty()).toBe(true);
    });
    
    it('nên báo lỗi khi tiêu đề quá ngắn', async () => {
      // Arrange
      const invalidData = {
        title: 'Test' // Chỉ 4 ký tự, yêu cầu ít nhất 5
      };
      
      // Act
      const result = await runValidation(updatePostValidation, invalidData);
      
      // Assert
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].path).toBe('title');
    });
    
    it('nên báo lỗi khi nội dung quá ngắn', async () => {
      // Arrange
      const invalidData = {
        content: 'Ngắn' // Không đủ 10 ký tự
      };
      
      // Act
      const result = await runValidation(updatePostValidation, invalidData);
      
      // Assert
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].path).toBe('content');
    });
    
    it('nên báo lỗi khi mô tả quá ngắn', async () => {
      // Arrange
      const invalidData = {
        description: 'Ngắn' // Không đủ 10 ký tự
      };
      
      // Act
      const result = await runValidation(updatePostValidation, invalidData);
      
      // Assert
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].path).toBe('description');
    });
    
    it('nên chấp nhận đối tượng rỗng', async () => {
      // Arrange
      const emptyData = {};
      
      // Act
      const result = await runValidation(updatePostValidation, emptyData);
      
      // Assert
      expect(result.isEmpty()).toBe(true);
    });
  });
}); 