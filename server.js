const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname)); // serve birthday.html and other static files

// Store OTP + email
let currentOtp = null;
let currentEmail = null;

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sakihasan8501@gmail.com",
    pass: "kevoqskqrauuqfle", // your app password (no spaces)
  },
});

// === SEND CODE: /send-code?email=... ===
app.get("/send-code", async (req, res) => {
  const email = req.query.email;

  console.log("send-code hit for:", email);

  if (!email || !email.endsWith("@gmail.com")) {
    return res.status(400).json({ message: "Valid Gmail required" });
  }

  // Generate 6-digit OTP
  currentOtp = Math.floor(100000 + Math.random() * 900000).toString();
  currentEmail = email;

  try {
    await transporter.sendMail({
      from: '"Birthday App" <sakihasan8501@gmail.com>',
      to: email,
      subject: "Your Birthday Login Code",
      text: `Your verification code is: ${currentOtp}`,
      html: `<p>Your verification code is: <b>${currentOtp}</b></p>`,
    });

    console.log(`OTP ${currentOtp} sent to ${email}`);
    res.json({ message: "Code sent to Gmail" });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ message: "Email sending failed" });
  }
});

// === VERIFY CODE: /verify-code?email=...&code=... ===
app.get("/verify-code", (req, res) => {
  const email = req.query.email;
  const code = req.query.code;

  console.log("verify-code hit for:", email, "code:", code);

  if (!email || !code) {
    return res
      .status(400)
      .json({ success: false, message: "Email and code required" });
  }

  if (email === currentEmail && code === currentOtp) {
    return res.json({ success: true, message: "OTP verified" });
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Invalid code" });
  }
});

// Serve birthday page explicitly
app.get("/birthday.html", (req, res) => {
  res.sendFile(path.join(__dirname, "birthday.html"));
});

// Root test route
app.get("/", (req, res) => {
  res.send("OTP server is running ✅");
});

// IMPORTANT: listen on Render's port
app.listen(PORT, () => {
  console.log(`OTP server running on port ${PORT}`);
});
