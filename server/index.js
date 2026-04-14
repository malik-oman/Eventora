const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv');
const mongoose = require('mongoose')
const authRoutes = require('./routes/auth')

dotenv.config()

// MIDLLEWARES==============================================
const app = express();
app.use(cors());
app.use(express.json())


// API ROUTES=====================================

app.use('/api/auth', authRoutes)

// CONNECT TO DATABAS=====================
mongoose.connect(process.env.MONGODB_URI).then(()=>{
  console.log('COnnected MongoDB')
})
.catch((error)=>{
  console.error('Error connecting to MongoDB:', error)
})

// PORT==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('App listening on port !');
});