const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
dotenv.config()

const transporter = nodemailer.createTransport({
  service:'gmail',
  auth:{
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS
  }
});

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
  try {
    const mailOptions = {
      from:process.env.EMAIL_USER,
      to: userEmail,
      subject:`Booking Confirmed: ${eventTitle}`,
            html: `
        <h2>Hi ${userName}!</h2>
        <p>Your booking for the event <strong>${eventTitle}</strong> is successfully confirmed.</p>
        <p>Thank you for choosing Eventora.</p>`
    };
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to', userEmail)
  } catch (error) {
    console.error('Error sent successfully:', error)
  }
}

exports.sendOtpEmail = async (email, otp, type) => {
  try {
  const title = type === 'account_verification' 
  ? 'Verify your Eventora Account' 
  : 'Eventora Booking Verification';

const msg = type === 'account_verification' 
  ? 'Please use the following OTP to verify your new Eventora account.' 
  : 'Please use the following OTP to verify and confirm your event booking.';

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: email,
  subject: title, // 👈 dynamic subject
  html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; text-align: center;">
        
        <h2 style="color: #333;">🔐 ${title}</h2>
        
        <p style="color: #555; font-size: 16px;">
          ${msg}
        </p>
        
        <div style="margin: 20px 0;">
          <span style="display: inline-block; background: #000; color: #fff; padding: 15px 25px; font-size: 24px; letter-spacing: 5px; border-radius: 8px;">
            ${otp}
          </span>
        </div>
        
        <p style="color: #777; font-size: 14px;">
          This OTP is valid for a limited time. Do not share it with anyone.
        </p>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
        
        <p style="font-size: 12px; color: #aaa;">
          If you did not request this, please ignore this email.
        </p>

      </div>
    </div>
  `
};

  await transporter.sendMail(mailOptions)
  console.log(`OTP email sent to ${email} for ${type}`);
  } catch (error) {
    console.error(`Error sending OTP email to ${email} for ${type}:`, error)
  }
}