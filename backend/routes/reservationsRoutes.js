const express = require('express');
const router  = express.Router();

const {
    createReservation,
    confirmReservation,
    cancelReservation,
    getUserReservations
} = require('../controllers/reservationsController');
const authMiddleware = require('../middleware/authMiddleware');

// Reservations Routes BEGIN

router.get('/',      authMiddleware, getUserReservations);
router.post('/',     authMiddleware, createReservation);
router.put('/:id',   authMiddleware, confirmReservation);
router.delete('/:id',authMiddleware, cancelReservation);

module.exports = router;

// Reservations Routes END