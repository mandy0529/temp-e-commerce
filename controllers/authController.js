// User Model require
const User = require('../models/User');

// http-status-codes require
const { StatusCodes } = require('http-status-codes');

// custom error require
const CustomError = require('../errors/index');

// jwt, createTokenUser
const { attachCookiesToResponse, createTokenUser } = require('../utils/index');

// ----------------------------------------------------------

// register controller
const register = async (req, res) => {
  const { email, password, name } = req.body;

  // 이미 존재하는 이메일을 쳤을 경우
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists');
  }

  // first registered user is an admin
  const isFirstAccount = await User.countDocuments({}) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  const user = await User.create({ email, password, name, role });

  // jwt token
  const tokenUser = createTokenUser(user);

  // cookie
  attachCookiesToResponse({ res, user: tokenUser });

  // status에 뿌려주기
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

// login controller
const login = async (req, res) => {
  const { email, password } = req.body;

  // email or password 가 일치하지 않을 때
  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password');
  }

  // 해당하는 user가 존재하지 않을 때
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid email user');
  }

  // 패스워드가 일치하지 않을 때
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid password user');
  }

  // jwt token
  const tokenUser = createTokenUser(user);

  // cookie
  attachCookiesToResponse({ res, user: tokenUser });

  // response 받기
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

// logout controller
const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    // 5초 뒤, 로그아웃 되게끔 로직 구현
    expires: new Date(Date.now())
  });

//   response 받기
  res.status(StatusCodes.OK).json({ msg: 'user logged out ! ' });
};

module.exports = { register, login, logout };