const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));  // serve static files

// Store OTP + email
let currentOtp = null;
let currentEmail = null;

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sakihasan8501@gmail.com",
    pass: "kevoqskqrauuqfle",   // your app password
  },
});

// Send OTP
app.get("/send-code", async (req, res) => {
  const email = req.query.email;

  if (!email || !email.endsWith("@gmail.com")) {
    return res.status(400).json({ message: "Valid Gmail required" });
  }

  currentOtp = Math.floor(100000 + Math.random() * 900000);
  currentEmail = email;

  try {
    await transporter.sendMail({
      from: '"Birthday App" <sakihasan8501@gmail.com>',
      to: email,
      subject: "Your Birthday Login Code",
      text: `Your verification code is: ${currentOtp}`,
      html: `<p>Your verification code is: <b>${currentOtp}</b></p>`
    });

    console.log(`OTP ${currentOtp} sent to ${email}`);
    res.json({ message: "Code sent to Gmail" });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ message: "Email sending failed" });
  }
});

// Verify OTP
app.get("/verify-code", (req, res) => {
  const code = req.query.code;

  if (!code || code != currentOtp) {
    return res.status(400).json({ message: "Invalid code" });
  }

  res.json({ message: "OTP Verified" });
});

// Serve birthday page
app.get("/birthday.html", (req, res) => {
  res.sendFile(path.join(__dirname, "birthday.html"));
});

// Root test route
app.get("/", (req, res) => {
  res.send("OTP server is running ✅");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
