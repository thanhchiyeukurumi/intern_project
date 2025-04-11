# Hệ thống Authentication & Authorization

## Giới thiệu

Hệ thống xác thực và phân quyền cho ứng dụng Blog, được xây dựng với NodeJS và Sequelize. Hệ thống hỗ trợ:

- Đăng ký, đăng nhập cho người dùng
- Xác thực thông qua OAuth 2.0 với Google và GitHub
- Phân quyền theo vai trò (RBAC) với 4 vai trò: Guest, User, Blogger, Admin
- JWT cho quản lý phiên đăng nhập

## Cài đặt

1. Cài đặt các dependencies:

```bash
npm install
```

2. Cấu hình môi trường:

- Sao chép file `.env.example` thành `.env`
- Cập nhật các biến môi trường cần thiết

3. Khởi tạo cơ sở dữ liệu:

```bash
npm run seed:dev
```

4. Khởi tạo vai trò (roles):

```bash
node scripts/init-roles.js
```

5. Khởi động ứng dụng:

```bash
npm run dev
```

## Cấu trúc API

### Đăng ký tài khoản
```
POST /api/auth/register
```
Request body:
```json
{
  "username": "username",
  "fullname": "Họ và tên",
  "email": "email@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "description": "Giới thiệu về bản thân"
}
```

### Đăng nhập
```
POST /api/auth/login
```
Request body:
```json
{
  "email": "email@example.com",
  "password": "password123"
}
```

### Xác thực Google
```
GET /api/auth/google
```

### Callback Google
```
GET /api/auth/google/callback
```

### Xác thực GitHub
```
GET /api/auth/github
```

### Callback GitHub
```
GET /api/auth/github/callback
```

### Lấy thông tin người dùng hiện tại
```
GET /api/auth/me
```
Authentication: Bearer Token

### Xác thực token
```
GET /api/auth/verify-token
```
Authentication: Bearer Token

## Phân quyền (RBAC)

Hệ thống sử dụng Role-Based Access Control (RBAC) với 4 vai trò:

1. **Guest** (Khách): Chỉ có thể xem nội dung công khai, không cần đăng nhập.
2. **User** (Người dùng): Có thể bình luận, like/unlike, bookmark bài viết sau khi đăng nhập.
3. **Blogger** (Người viết blog): Có thể tạo, sửa, xóa bài viết của mình ngoài các quyền của User.
4. **Admin** (Quản trị viên): Có toàn quyền quản lý hệ thống.

## Cách sử dụng Middleware

### Xác thực người dùng
```javascript
const { auth } = require('kernels/middlewares');

// Áp dụng middleware xác thực
router.get('/protected-route', auth.authenticateJWT, controller.method);
```

### Kiểm tra vai trò
```javascript
const { auth, role } = require('kernels/middlewares');

// Kiểm tra vai trò admin
router.get('/admin/dashboard', auth.authenticateJWT, role.isAdmin, controller.dashboard);

// Kiểm tra nhiều vai trò
router.get('/content/manage', auth.authenticateJWT, role.hasRole(['admin', 'blogger']), controller.manageContent);

// Kiểm tra blogger
router.post('/posts', auth.authenticateJWT, role.isBlogger, controller.createPost);

// Kiểm tra đã đăng nhập
router.get('/profile', auth.authenticateJWT, role.isAuthenticated, controller.getProfile);
```

## Response Format

Tất cả các API đều trả về định dạng thống nhất:

```json
{
  "success": true/false,
  "data": [...dữ liệu hoặc null nếu lỗi...],
  "status": 200,
  "message": "Thông báo"
}
``` 