const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");          // ⬅️ add this line

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(__dirname));    // ⬅️ add this line
// Store last OTP and email
let currentOtp = null;
let currentEmail = null;

// === CONFIGURE GMAIL SENDER ===
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sakihasan8501@gmail.com",      // <-- change this
    pass: "kevoqskqrauuqfle",    // <-- change this
  },
});

// === SEND CODE: /send-code?email=xxx@gmail.com ===
app.get("/send-code", async (req, res) => {
  const email = req.query.email;

  if (!email || !email.endsWith("@gmail.com")) {
    return res.status(400).json({ message: "Valid Gmail is required" });
  }

  // Generate 6-digit OTP
  currentOtp = Math.floor(100000 + Math.random() * 900000).toString();
  currentEmail = email;

  try {
    await transporter.sendMail({
      from: '"Birthday App" <YOUR_GMAIL_HERE@gmail.com>',
      to: email,
      subject: "Your Birthday Login Code",
      text: `Your verification code is: ${currentOtp}`,
      html: `<p>Your verification code is: <b>${currentOtp}</b></p>`,
    });

    console.log(`OTP ${currentOtp} sent to ${email}`);
    res.json({ message: "Code sent to Gmail" });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ message: "Error sending email" });
  }
});

// === VERIFY CODE: /verify-code?email=...&code=... ===
app.get("/verify-code", (req, res) => {
  const email = req.query.email;
  const code = req.query.code;

  if (!email || !code) {
    return res
      .status(400)
      .json({ success: false, message: "Email and code required" });
  }

  if (email === currentEmail && code === currentOtp) {
    return res.json({ success: true });
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Invalid code" });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("OTP server is working ✅");
});

app.listen(PORT, () => {
  console.log(`OTP server running on http://localhost:${PORT}`);
});
