const {sendOtpEmail} = require('../utils/email')
const OTP = require('../models/otp')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


// ============ GENERATE===TOKEN===================

const generateToken = (id, role) => {
  return jwt.sign({id, role}, process.env.JWT_SECRET, {expiresIn: '7d'})
}



// REGISTER USER =================================

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      isVerified: false
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`OTP for ${email}: ${otp}`);

    await OTP.create({
      email,
      otp,
      action: 'account_verification'
    });

    await sendOtpEmail(email, otp, 'account_verification');

    res.status(201).json({
      message: "User registered successfully. Please check your email for OTP to verify your account",
      email: user.email
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN USER ===============================

exports.loginUser = async (req,res) => {
  const {email,password} = req.body;

  let user = await User.findOne({email});

  if (!user) {
    return res.status(400).json({error:"Invalid Credentials"});
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({error:"Invalid Credentials"});
  }

  if(!user.isVerified && user.role === 'user'){
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({email, action: 'account_verification'})
    await OTP.create({email, otp, action: "account_verification"});
    await sendOtpEmail(email, otp, 'account_verification');
    return res.status(400).json({
      error:"Account not verified. A new OTP has been sent to your email."
    });
  }

  res.json({
    message:"Login Successful",
    _id: user._id,
    name:user.name,
    email:user.email,
    role:user.role,
    token: generateToken(user._id, user.role)
  })
   

};

// ============== VERIFY=============OTP=================

exports.verifyOtp = async (req,res) => {
  const {email, otp} = req.body;
  const otpRecord = await OTP.findOne({email, otp, action: 'account_verification'});

  if (!otpRecord) {
    return res.status(400).json({error:"Invalid or expired OTP"})
  }

 const user = await User.findOneAndUpdate({email}, {isVerified:true});
  await OTP.deleteMany({email, action:'account_verification'});
  res.json({
    message:"Account verified successfully. You can now log in.",
    _id: user._id,
    name:user.name,
    email:user.email,
    role:user.role,
    token: generateToken(user._id, user.role)

  })
}