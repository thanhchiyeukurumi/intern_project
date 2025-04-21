module.exports = async () => {
    const sequelize = global.__SEQUELIZE__;
    const umzug = global.__UMZUG__;

    if (sequelize) {
        try {
            await umzug.down({to: 0}) // Chạy ngược tất cả các migrations (down về version 0). Việc này sẽ xóa tất cả các bảng đã được tạo trong database test.
            await sequelize.close(); // Đóng kết nối đến database test.
        } catch (error) {
            console.error(error);
        }
    }
};