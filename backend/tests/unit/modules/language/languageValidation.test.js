const { createLanguageValidation, updateLanguageValidation } = require('modules/language/validations/languageValidation');
const { validationResult } = require('express-validator');
const httpMocks = require('node-mocks-http');

// Helper function để chạy validation
const runValidation = async (validationRules, reqBody) => {
  const req = httpMocks.createRequest({
    method: 'POST',
    body: reqBody
  });
  
  // Chạy tất cả các validation rules
  for (const validation of validationRules) {
    await validation.run(req); // chạy tất cả các validation rules
  }
  
  return validationResult(req); // lấy kết quả validation
};

describe('Language Validation', () => {
  describe('createLanguageValidation', () => {
    it('Dữ liệu hợp lệ', async () => {
      // Arrange
      const validData = {
        locale: 'vi',
        name: 'Tiếng Việt',
        is_active: true
      };
      
      // Act
      const result = await runValidation(createLanguageValidation, validData);
      
      // Assert
      expect(result.isEmpty()).toBe(true);
    });
    
    it('Lỗi thiếu locale', async () => {
      // Arrange
      const invalidData = {
        name: 'Tiếng Việt',
        is_active: true
      };
      
      // Act
      const result = await runValidation(createLanguageValidation, invalidData);
      
      // Assert
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].path).toBe('locale');
    });
    
    it('Lỗi thiếu name', async () => {
      // Arrange
      const invalidData = {
        locale: 'vi',
        is_active: true
      };
      
      // Act
      const result = await runValidation(createLanguageValidation, invalidData);
      
      // Assert
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].path).toBe('name');
    });
    
    it('Lỗi locale không đúng định dạng', async () => {
      // Arrange
      const invalidData = {
        locale: 'invalid',
        name: 'Tiếng Việt',
        is_active: true
      };
      
      // Act
      const result = await runValidation(createLanguageValidation, invalidData);
      
      // Assert
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].path).toBe('locale');
    });
    
    it('Lỗi name quá ngắn', async () => {
      // Arrange
      const invalidData = {
        locale: 'vi',
        name: 'T', // Chỉ 1 ký tự, yêu cầu ít nhất 2 ký tự
        is_active: true
      };
      
      // Act
      const result = await runValidation(createLanguageValidation, invalidData);
      
      // Assert
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].path).toBe('name');
    });
    
    it('Lỗi name quá dài', async () => {
      // Arrange
      const invalidData = {
        locale: 'vi',
        name: 'A'.repeat(51), // 51 ký tự, giới hạn là 50
        is_active: true
      };
      
      // Act
      const result = await runValidation(createLanguageValidation, invalidData);
      
      // Assert
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].path).toBe('name');
    });
    
    it('Lỗi is_active không phải boolean', async () => {
      // Arrange
      const invalidData = {
        locale: 'vi',
        name: 'Tiếng Việt',
        is_active: 'yes' // Không phải boolean
      };
      
      // Act
      const result = await runValidation(createLanguageValidation, invalidData);
      
      // Assert
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].path).toBe('is_active');
    });
    
    it('Chấp nhận cả locale có định dạng xx-XX', async () => {
      // Arrange
      const validData = {
        locale: 'vi-VN',
        name: 'Tiếng Việt',
        is_active: true
      };
      
      // Act
      const result = await runValidation(createLanguageValidation, validData);
      
      // Assert
      expect(result.isEmpty()).toBe(true);
    });
  });
  
  describe('updateLanguageValidation', () => {
    it('Dữ liệu hợp lệ', async () => {
      // Arrange
      const validData = {
        locale: 'en',
        name: 'English',
        is_active: false
      };
      
      // Act
      const result = await runValidation(updateLanguageValidation, validData);
      
      // Assert
      expect(result.isEmpty()).toBe(true);
    });
    
    it('Chỉ cập nhật một số trường', async () => {
      // Arrange
      const partialData = {
        name: 'Français'
      };
      
      // Act
      const result = await runValidation(updateLanguageValidation, partialData);
      
      // Assert
      expect(result.isEmpty()).toBe(true);
    });
    
    it('Lỗi locale không đúng định dạng', async () => {
      // Arrange
      const invalidData = {
        locale: 'invalid-format'
      };
      
      // Act
      const result = await runValidation(updateLanguageValidation, invalidData);
      
      // Assert
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].path).toBe('locale');
    });
    
    it('Lỗi name quá ngắn', async () => {
      // Arrange
      const invalidData = {
        name: 'A' // Chỉ 1 ký tự
      };
      
      // Act
      const result = await runValidation(updateLanguageValidation, invalidData);
      
      // Assert
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].path).toBe('name');
    });
    
    it('Lỗi name quá dài', async () => {
      // Arrange
      const invalidData = {
        name: 'A'.repeat(51) // 51 ký tự
      };
      
      // Act
      const result = await runValidation(updateLanguageValidation, invalidData);
      
      // Assert
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].path).toBe('name');
    });
    
    it('Chấp nhận đối tượng rỗng', async () => {
      // Arrange
      const emptyData = {};
      
      // Act
      const result = await runValidation(updateLanguageValidation, emptyData);
      
      // Assert
      expect(result.isEmpty()).toBe(true);
    });
  });
}); 