const express = require('express');
const router  = express.Router();
 
const { registerLocal, loginLocal, callbackOIDC } = require('../controllers/authController');
 
// Auth Routes BEGIN
 
router.post('/register', registerLocal);
router.post('/login',    loginLocal);
 
module.exports = router;
 
// Auth Routes END
 