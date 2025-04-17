
module.exports = {
    testEnvironment: "node",
    globalSetup: '<rootDir>/tests/jest.globalSetup.js', // Chạy một lần duy nhất trước khi chạy các test
    globalTeardown: '<rootDir>/tests/jest.globalTeardown.js', // Chạy một lần duy nhất sau khi chạy các test
    moduleDirectories: ["node_modules", "<rootDir>"],
    modulePaths: ["<rootDir>"],
    roots: ["<rootDir>"],
    rootDir: ".",
    testMatch:[
        "<rootDir>/modules/**/*.test.js",
        "<rootDir>/tests/**/*.test.js"
    ],
};
