const express = require('express');
const { signup, login, updateUser, makeAdmin } = require('../controller/user.controller');
const router = express.Router();



router.post('/signup', signup);
router.post('/login', login);
router.patch('/makeAdmin/:userId', makeAdmin);
router.patch('/updateUser/:userID', updateUser);






module.exports = router