/**
 * Middleware kiểm tra quyền truy cập dựa trên vai trò
 * 
 * @fileoverview File này tham chiếu đến các middleware phân quyền trong kernels/middlewares/role
 * để duy trì khả năng tương thích ngược.
 */

// Tái export từ kernels/middlewares/role
module.exports = require('kernels/middlewares').role; 