const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
const fs = require("fs");
const YAML = require("yaml");

// Đọc các file YAML
const readYamlFile = (filePath) => {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return YAML.parse(fileContent);
    } catch (error) {
        console.error(`Error reading YAML file ${filePath}:`, error);
        return null;
    }
};

// Đường dẫn đến thư mục swagger
const swaggerDir = path.join(__dirname, '../../swagger');

// Đọc file index.yaml (định nghĩa chung)
const indexFile = path.join(swaggerDir, 'index.yaml');
const indexSpec = readYamlFile(indexFile);

// Đọc các file paths khác
const authFile = path.join(swaggerDir, 'auth.yaml');
const languagesFile = path.join(swaggerDir, 'languages.yaml');
const categoriesFile = path.join(swaggerDir, 'categories.yaml');
const usersFile = path.join(swaggerDir, 'users.yaml');
const postsFile = path.join(swaggerDir, 'posts.yaml');
const commentsFile = path.join(swaggerDir, 'comments.yaml');
const uploadsFile = path.join(swaggerDir, 'uploads.yaml');

// Kết hợp tất cả paths
const authSpec = readYamlFile(authFile);
const languagesSpec = readYamlFile(languagesFile);
const categoriesSpec = readYamlFile(categoriesFile);
const usersSpec = readYamlFile(usersFile);
const postsSpec = readYamlFile(postsFile);
const commentsSpec = readYamlFile(commentsFile);
const uploadsSpec = readYamlFile(uploadsFile);

// Kết hợp tất cả paths vào spec chính
if (indexSpec) {
    indexSpec.paths = {
        ...indexSpec.paths,
        ...(authSpec ? authSpec.paths : {}),
        ...(languagesSpec ? languagesSpec.paths : {}),
        ...(categoriesSpec ? categoriesSpec.paths : {}),
        ...(usersSpec ? usersSpec.paths : {}),
        ...(postsSpec ? postsSpec.paths : {}),
        ...(commentsSpec ? commentsSpec.paths : {}),
        ...(uploadsSpec ? uploadsSpec.paths : {})
    };
}

// Tạo Swagger UI
const swaggerUIOptions = {
    swaggerOptions: {
        defaultModelsExpandDepth: -1, // Ẩn mục Models
    }
};

module.exports = {
    swaggerUIServe: swaggerUi.serve,
    swaggerUISetup: swaggerUi.setup(indexSpec, swaggerUIOptions)
}