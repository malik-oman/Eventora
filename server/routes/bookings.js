const express = require("express");
const { protect, admin } = require("../middleware/auth");
const {bookEvent,sendBookingOTP,getMyBooking,confirmBooking,cancelBooking} = require('../controllers/bookingController')


const router = express.Router();

router.post('/', protect, bookEvent);
router.post('/send-otp', protect, sendBookingOTP)
router.get('/my', protect, getMyBooking);
router.put('/:id/confirm', protect,admin, confirmBooking);
router.delete('/:id',protect, cancelBooking)

module.exports = router;
