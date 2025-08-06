const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "marawangodey@gmail.com",
    pass: "oljh igjy nxdk fmzd" // كلمة مرور التطبيقات
  }
});

const lastSentTimes = {};
const DELAY_MS = 60 * 1000; // دقيقة بين الإرسال لكل إيميل

app.get("/", (req, res) => {
  res.send("📨 Villatrex TimeServer is running.");
});

app.post("/send", async (req, res) => {
  const { subject, message, email } = req.body;

  if (!subject || !message || !email) {
    return res.status(400).json({ success: false, message: "البيانات ناقصة." });
  }

  const now = Date.now();

  if (lastSentTimes[email] && now - lastSentTimes[email] < DELAY_MS) {
    const waitTime = Math.ceil((DELAY_MS - (now - lastSentTimes[email])) / 1000);
    return res.status(429).json({
      success: false,
      message: `⏳ من فضلك انتظر ${waitTime} ثانية قبل إرسال رسالة أخرى.`
    });
  }

  const mailOptions = {
    from: `"Contact Form" <${email}>`,
    to: "marawangodey@gmail.com",
    subject: `[Villatrex Contact] ${subject}`,
    text: `📩 رسالة من: ${email}\n\n${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ رسالة تم إرسالها من: ${email}`);

    lastSentTimes[email] = now;

    res.json({ success: true, message: "✅ تم إرسال الرسالة بنجاح." });
  } catch (error) {
    console.error("❌ فشل إرسال الرسالة:", error);
    res.status(500).json({ success: false, message: "❌ فشل في إرسال الإيميل." });
  }
});

app.listen(PORT, () => {
  console.log(`📨 TimeServer is running on http://localhost:${PORT}`);
})