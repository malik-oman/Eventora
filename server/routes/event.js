const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {getAllEvents, getEventById, createEvent, updateEvent, deleteEvent} = require('../controllers/eventController')


// GET ALL EVENTS==================================

router.get('/', getAllEvents);

// GET EVENT BY ID============

router.get('/:id', getEventById);

// CREATE EVENT=====================

router.post('/', protect,admin, createEvent);

// UPDATE EVENT=====================

router.put('/:id', protect,admin, updateEvent);

// DELETE EVENT ============

router.delete('/:id', protect, admin, deleteEvent);

module.exports = router
