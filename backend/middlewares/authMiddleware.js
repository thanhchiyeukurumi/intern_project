/**
 * Middleware xác thực JWT token và OAuth
 * 
 * @fileoverview File này tham chiếu đến các middleware xác thực trong kernels/middlewares/auth
 * để duy trì khả năng tương thích ngược.
 */

// Tái export trực tiếp từ authMiddlewares
module.exports = require('../kernels/middlewares/authMiddlewares'); 