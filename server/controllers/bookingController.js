const Bookings = require('../models/Bookings')
const OTP = require('../models/otp')
const Event = require('../models/Event')
const {sendOtpEmail, sendBookingEmail} = require('../utils/email');


// GENERATE OTP FUNCTION===================================

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// BOOK  OTP EVENT =============================

exports.sendBookingOTP = async (req,res) => {
  const otp = generateOtp()
  await OTP.findOneAndDelete({email: req.user.email, action:'event_booking'})
  await OTP.create({email: req.user.email, otp: otp, action: 'event_booking'})
  await sendOtpEmail(req.user.email, otp, 'event_booking')

 res.json({message:"OTP send to email"});
   
}

// EVENT BOOKING===================

exports.bookEvent = async (req,res) => {
   const {eventId, otp} = req.body;

   const otpRecord = await OTP.findOne({email: req.user.email, otp, action:'event_booking'})
   if (!otpRecord) {
     return res.status(400).json({error:"Invalid or expired OTP"});
   }

   const event = await Event.findById(eventId);
   if(!event){
    return res.status(404).json({error:"Event not found"})
   }

   if(event.totalSeats <= 0) {
    return res.status(400).json({error:"No Seats Available"})
   }

   const existingBooking = await Bookings.findOne({userId: req.user._id, eventId})
   if(existingBooking){
    return res.status(400).json({error:"You have already booked this event "})
   }

   const booking = await Bookings.create({
    userId: req.user._id,
    eventId,
    status:'pending',
    paymentStatus:'non_paid',
    amount: event.ticketPrice
   });

   await OTP.deleteMany({email: req.user.email, action:'event_booking'});
   await sendBookingEmail(req.user.email, event.title, booking._id)
   res.status(201).json({message:'Booking created. Please Check your email for verification'})


} 

// CONFIREM BOOKING  CONTROLLER===================================

exports.confirmBooking = async (req,res) => {
  const paymentStatus = req.body.paymentStatus;
  if (paymentStatus && ['paid','non_paid'].includes(paymentStatus)) {
    return res.status(400).json({error:"Invalid Payment Status"});
  }
  const booking = await Bookings.findById(req.params.id).populate('eventId');
  if(!booking){
    return res.status(404).json({error:'Booking not found'})
  }

  if(booking.status === 'confirmed'){
    return res.status(400).json({error:'Booking is already confirmed'})
  }

  const event = await Event.findById(booking.eventId._id);
  if(event.totalSeats <=0){
    return res.status(400).json({error:'No Seats available'})
  }

  booking.status = 'confirmed';
  if(paymentStatus){
    booking.paymentStatus = paymentStatus;
  };
  await booking.save();
  event.totalSeats -= 1;
  await event.save();

  // admin confirmed,=========================
  await sendBookingEmail(req.user.email, event.title, booking._id);

  res.json({message:"Booking confirmed"})

  
}

// GET MY BOOKING CONTROLLER==================================

exports.getMyBooking = async (req,res) => {
  const bookings = await Bookings.find({userId: req.user._id}).populate('eventId');
  res.json(bookings)
}

// CANCLE BOOKING=============================

exports.cancelBooking = async (req,res) => {
  const booking = await Bookings.findById(req.params.id);
  if(!booking){
    return res.status(404).json({error:'Booking not found'})
  }
  if (booking.userId.toString() !== req.user._id.toString() ) {
    return res.status(403).json({error:'Unathorized'})
  }

 booking.status = 'cancelled';
 await booking.save();

  if(booking.status === 'confirmed') {
    const event = await Event.findById(booking.eventId._id)
    event.totalSeats +=1;
    await event.save()
  }

  await booking.remove();
  res.json({message:"Booking cancelled"})
}