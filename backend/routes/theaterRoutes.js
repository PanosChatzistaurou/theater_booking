const express = require('express');
const router  = express.Router();

const { getTheaters, getShowtimes } = require('../controllers/theaterController');
const authMiddleware                 = require('../middleware/authMiddleware');

// Theater Routes BEGIN

router.get('/',               authMiddleware, getTheaters);
router.get('/:id/showtimes',  authMiddleware, getShowtimes);

module.exports = router;

// Theater Routes END