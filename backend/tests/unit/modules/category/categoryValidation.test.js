const { createCategoryValidation, updateCategoryValidation } = require('modules/category/validations/categoryValidation');
const { validationResult } = require('express-validator');
const httpMocks = require('node-mocks-http');

const runValidation = async (validationRules, reqBody) => {
    const req = httpMocks.createRequest({
        method: 'POST',
        body: reqBody
    });

    for (const validation of validationRules) { 
        await validation.run(req);
    }

    return validationResult(req);
};

describe('Category Validation', () => {
    describe('createCategoryValidation', () => {
        it('Dữ liệu hợp lệ', async () => {
            // Arrange
            const validData = {
                name: 'Test Category',
                parent_id: null
            };

            // Act
            const result = await runValidation(createCategoryValidation, validData);

            // Assert
            expect(result.isEmpty()).toBe(true);
        });

        it('Lỗi thiếu tên danh mục', async () => {
            const invalidData = {
                parent_id: null
            };
            const result = await runValidation(createCategoryValidation, invalidData);
            expect(result.isEmpty()).toBe(false);
            expect(result.array()[0].path).toBe('name');
        })
    })      
})  

describe('updateCategoryValidation', () => {
    it('Dữ liệu hợp lệ', async () => {
        // Arrange
        const validData = {
            name: 'Test Category',
            parent_id: null,
            locale: 'vi'
        };

        // Act
        const result = await runValidation(updateCategoryValidation, validData);

        // Assert
        expect(result.isEmpty()).toBe(true);    
    });

    it('Lỗi thiếu tên danh mục', async () => {
        const invalidData = {
            parent_id: null,
            locale: 'vi'
        };

        const result = await runValidation(updateCategoryValidation, invalidData);
        expect(result.isEmpty()).toBe(false);
        expect(result.array()[0].path).toBe('name');
    })  
})