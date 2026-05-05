const express = require('express');
const router = express.Router();
const { getTheaters, getShowtimes } = require('../controllers/theaterController');

router.get('/', getTheaters);
router.get('/:id/showtimes', getShowtimes);

module.exports = router;