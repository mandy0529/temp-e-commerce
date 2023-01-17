// jwt
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

// create token
const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_LIFETIME });

  return token;
};

// valid token
const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

// cookies to response
const attachCookiesToResponse = ({ res, user }) => {
  // jwt 에서 token 발행
  const token = createJWT({ payload: user });

  // 유효기간 변수
  const oneDay = 1000 * 60 * 60 * 24;

  // res.cookie
  res.cookie('token', token, {
    // only browser
    httpOnly: true,
    // by one day expired 되도록 설정
    expires: new Date(Date.now() + oneDay),

    // secure
    secure: process.env.NODE_ENV === 'production',

    // signed
    signed: true
  });

};

module.exports = { createJWT, isTokenValid, attachCookiesToResponse };