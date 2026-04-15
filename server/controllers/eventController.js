const Event = require("../models/Event");

// GET ALL EVENT CONTROLLER==========================

exports.getAllEvents = async (req, res) => {
  try {
    const filters = {};
    if (req.query.category) {
      filters.category = req.query.category;
    }
    if (req.query.location) {
      filters.location = req.query.location;
    }

    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET EVENT BY ID =========================

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE EVENT ===========================
exports.createEvent = async (req, res) => {
  const {
    title,
    description,
    date,

    location,
    category,
    totalSeats,
    availableSeats,
    ticketPrice,
    imageUrl,
  } = req.body;
  try {
    const event = await Event.create({
      title,
      description,
      date,

      location,
      category,
      totalSeats,
      availableSeats,
      ticketPrice,
      imageUrl,
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE EVENT ===============================
exports.updateEvent = async (req, res) => {
  const {
    title,
    description,
    date,
    location,
    category,
    totalSeats,
    availableSeats,
    ticketPrice,
    imageUrl,
  } = req.body;
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, {
      title,
      description,
      date,
      location,
      category,
      totalSeats,
      availableSeats,
      ticketPrice,
      imageUrl,
    },{new:true});
    if(!event) {
      return res.status(404).json({error:"Event not found"})
    }
    res.json(event)
  } catch (error) {
    returnres.status(500).json({error: error.message});
  }
};

// DELETE EVENT ======================

exports.deleteEvent = async (req,res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({error: 'Event not found'})
    }
    res.json({message:"Event deleted Successful"})
  } catch (error) {
    res.status(500).json({error: error.message})
  }
};
