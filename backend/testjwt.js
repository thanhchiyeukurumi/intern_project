const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { userId: 123, role: "admin" },
  "tntn",
  {
    expiresIn: "1h",
    algorithm: "HS256",
  }
);

console.log(token);
