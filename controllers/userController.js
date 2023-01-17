// User Model require
const User = require('../models/User');

// StatusCodes require
const { StatusCodes } = require('http-status-codes');

// errors
const CustomError = require('../errors');

// tokenUser
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions
} = require('../utils/index');

// ----------------------------------------------

// get all users
const getAllUsers = async (req, res) => {
  console.log(req.user, '@@@');
  // find all user
  const users = await User.find({ role: 'user' }).select('-password');
  res.status(StatusCodes.OK).json({ users });
};

// get single user
const getSingleUser = async (req, res) => {
  // find single user with params id
  const { id } = req.params;
  const user = await User.findOne({ _id: id }).select('-password');

  // user가 없을 경우
  if (!user) {
    throw new Error(CustomError.NotFoundError(`No user with id : ${id}`));
  }

  // checkPermissions
  checkPermissions(req.user, user._id);
  // res 보내주기
  res.status(StatusCodes.OK).json({ user });
};

// show current user
const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

// update user with user.save()
const updateUser = async (req, res) => {
  // email, name 있는지 체크
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError('Please provide all values');
  }

  // user.save() 써서 값 바꿔주기
  const user = await User.findOne({ _id: req.user.userId });
  user.email = email;
  user.name = name;

  await user.save();

  // create tokenUser
  const tokenUser = createTokenUser(user);

  // attachCookiesToResponse
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });

};

// update user password
const updateUserPassword = async (req, res) => {
  // 그냥 내가 정하고싶은 변수명으로 지어주면 된다.
  const { gun, cono } = req.body;

  console.log(req.body);
  // 원래 password나 새로 바꾸려는 password 값이 없을때
  if (!gun || !cono) {
    throw new CustomError.BadRequestError('Please provide both values');
  }
  // user 찾기
  const user = await User.findOne({ _id: req.user.userId });

  // 원래 password가 일치하는지 확인하고, 틀리면 error, 맞으면 값 집어넣고, 저장시키기
  const isPasswordCorrect = await user.comparePassword(gun);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthorizedError('invalid credentials');
  }
  // 새로운 password 값 대입 !
  user.password = cono;

  // 새로운 password 값 저장 !
  await user.save();

  // res 날려주기
  res.status(StatusCodes.OK).json({ msg: 'Success ! Password updated' });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword
};

// update user with findOneAndUpdate
// const updateUser = async (req, res) => {
//   // email, name 있는지 체크
//   const { email, name } = req.body;
//   if (!email || !name) {
//     throw new CustomError.BadRequestError('Please provide all values');
//   }
//
//   // findOneAndUpdate 써서 값 바꿔주기
//   const user = await User.findOneAndUpdate({ _id: req.user.userId }, {
//     email,
//     name
//   }, { new: true, runValidators: true });
//
//   // create tokenUser
//   const tokenUser = createTokenUser(user);
//
//   // attachCookiesToResponse
//   attachCookiesToResponse({ res, user: tokenUser });
//   res.status(StatusCodes.OK).json({ user: tokenUser });
//
// };