const auth = require('./authMiddlewares');
const role = require('./roleMiddlewares');

const middlewares = (middlewareArray) => {
    return [
        ...middlewareArray
    ]
}

module.exports = {
    middlewares,
    auth,
    role
}