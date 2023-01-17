// error require
const CustomError = require('../errors');

// token valid check require
const { isTokenValid } = require('../utils');

// -----------------------------------------------

// authenticate user function
const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  // token이 존재하지 않을 때
  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid token');
  }
  try {
    const { name, userId, role } = isTokenValid({ token });
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError(
        'Authentication Invalid token payload');
  }
};

// authorize permission function
const authorizePermissions = (...rest) => {
  return async (req, res, next) => {
    if (!rest.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
          'Unauthorized to access this route');
    }
    next();
  };

};

module.exports = { authenticateUser, authorizePermissions };