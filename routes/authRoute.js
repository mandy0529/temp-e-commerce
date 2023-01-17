// express require
const express = require('express');

// ---------------------------------------------------

// router setup
const router = express.Router();

// import all controllers
const { register, login, logout } = require('../controllers/authController');

// routes
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;

