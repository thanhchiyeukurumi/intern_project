var DataTypes = require("sequelize").DataTypes;
var _categories = require("./categories");
var _comments = require("./comments");
var _languages = require("./languages");
var _post_categories = require("./post_categories");
var _posts = require("./posts");
var _roles = require("./roles");
var _sequelizemeta = require("./sequelizemeta");
var _users = require("./users");

function initModels(sequelize) {
  var categories = _categories(sequelize, DataTypes);
  var comments = _comments(sequelize, DataTypes);
  var languages = _languages(sequelize, DataTypes);
  var post_categories = _post_categories(sequelize, DataTypes);
  var posts = _posts(sequelize, DataTypes);
  var roles = _roles(sequelize, DataTypes);
  var sequelizemeta = _sequelizemeta(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  categories.belongsTo(categories, { as: "parent", foreignKey: "parent_id"});
  categories.hasMany(categories, { as: "categories", foreignKey: "parent_id"});
  post_categories.belongsTo(categories, { as: "category", foreignKey: "category_id"});
  categories.hasMany(post_categories, { as: "post_categories", foreignKey: "category_id"});
  posts.belongsTo(languages, { as: "language", foreignKey: "language_id"});
  languages.hasMany(posts, { as: "posts", foreignKey: "language_id"});
  comments.belongsTo(posts, { as: "post", foreignKey: "post_id"});
  posts.hasMany(comments, { as: "comments", foreignKey: "post_id"});
  post_categories.belongsTo(posts, { as: "post", foreignKey: "post_id"});
  posts.hasMany(post_categories, { as: "post_categories", foreignKey: "post_id"});
  posts.belongsTo(posts, { as: "original_post", foreignKey: "original_post_id"});
  posts.hasMany(posts, { as: "posts", foreignKey: "original_post_id"});
  users.belongsTo(roles, { as: "role", foreignKey: "role_id"});
  roles.hasMany(users, { as: "users", foreignKey: "role_id"});
  comments.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(comments, { as: "comments", foreignKey: "user_id"});
  posts.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(posts, { as: "posts", foreignKey: "user_id"});

  return {
    categories,
    comments,
    languages,
    post_categories,
    posts,
    roles,
    sequelizemeta,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
