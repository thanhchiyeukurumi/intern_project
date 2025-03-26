/**
 * Middleware xác thực JWT token và OAuth
 * 
 * @fileoverview File này tham chiếu đến các middleware xác thực trong kernels/middlewares/auth
 * để duy trì khả năng tương thích ngược.
 */

// Tái export từ kernels/middlewares/auth
module.exports = require('kernels/middlewares').auth; 