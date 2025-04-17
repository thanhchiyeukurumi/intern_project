const request = require('supertest');
const path = require('path');
const app = require('../../index');
const { cloudinary } = require('../../configs/cloudinary');

describe('Upload API', () => {
  let token;
  let publicId;

  // Trước khi chạy test, đăng nhập để lấy token
  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin@123'
      });

    token = loginResponse.body.data.token;
  });

  // Test upload đơn ảnh
  describe('POST /api/uploads/image', () => {
    it('Nên từ chối khi không có xác thực', async () => {
      const response = await request(app)
        .post('/api/uploads/image')
        .attach('image', path.join(__dirname, '../fixtures/test-image.jpg'));

      expect(response.status).toBe(401);
    });

    it('Nên upload ảnh thành công', async () => {
      const response = await request(app)
        .post('/api/uploads/image')
        .set('Authorization', `Bearer ${token}`)
        .attach('image', path.join(__dirname, '../fixtures/test-image.jpg'));

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('url');
      expect(response.body.data).toHaveProperty('publicId');

      // Lưu publicId để xóa sau khi test
      publicId = response.body.data.publicId;
    });

    it('Nên từ chối khi không có file', async () => {
      const response = await request(app)
        .post('/api/uploads/image')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });
  });

  // Test xóa file đã upload sau khi test
  describe('DELETE /api/uploads/:publicId', () => {
    it('Nên xóa ảnh thành công', async () => {
      // Bỏ qua test nếu không có publicId
      if (!publicId) {
        return;
      }

      const response = await request(app)
        .delete(`/api/uploads/${publicId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  // Sau khi test, đảm bảo dọn dẹp các file đã upload lên Cloudinary
  afterAll(async () => {
    // Nếu publicId vẫn còn tồn tại, xóa nó
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Lỗi khi dọn dẹp sau test:', error);
      }
    }
  });
}); 