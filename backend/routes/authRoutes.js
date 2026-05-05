const express = require('express');
const router = express.Router();
const { 
    loginOIDC, 
    registerLocal, 
    loginLocal 
} = require('../controllers/authController');


router.post('/oidc-login', loginOIDC);


router.post('/register', registerLocal);
router.post('/login', loginLocal);

module.exports = router;