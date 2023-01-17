// express
const express = require('express');

// router
const router = express.Router();

// import all controllers
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUserPassword,
  updateUser
} = require('../controllers/userController');

// authenticate function require
const {
  authenticateUser,
  authorizePermissions
} = require('../middleware/authentication');

// ----------------------------------------------------

// get all users
router.route('/').get(authenticateUser, authorizePermissions('admin', 'owner'), getAllUsers);

// show current user
router.route('/showMe').get(authenticateUser, showCurrentUser);

// update user
router.route('/updateUser').patch(authenticateUser, updateUser);
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword);

// get single user
// 맨 아래 위치 할 것 ⚠️
router.route('/:id').get(authenticateUser, getSingleUser);

module.exports = router;

