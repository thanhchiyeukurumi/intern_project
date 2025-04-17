require("rootpath")();
const { umzug,sequelize } = require("kernels/tests");

module.exports = async () => {
    try {
        await sequelize.authenticate() // Kiểm tra kết nối đến db
        await umzug.up() // Chạy các migration lên database test
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

global.__SEQUELIZE__ = sequelize; // Lưu instance Sequelize của DB test vào biến global để các file test khác có thể truy cập nếu cần (mặc dù thường không cần thiết vì model tự dùng instance sequelize đúng).
global.__UMZUG__=umzug; // Lưu instance Umzug vào biến global (ít dùng hơn).
