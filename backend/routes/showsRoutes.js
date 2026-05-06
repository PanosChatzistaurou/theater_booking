const express = require('express');
const router  = express.Router();

const { getShows, getShowtimeSeats } = require('../controllers/showsController');
const authMiddleware                  = require('../middleware/authMiddleware');

// Shows Routes BEGIN

router.get('/',                       authMiddleware, getShows);
router.get('/showtimes/:id/seats',    authMiddleware, getShowtimeSeats);

module.exports = router;

// Shows Routes END