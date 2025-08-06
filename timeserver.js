const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

// إعداد nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'marawangodey@gmail.com', // إيميلك
    pass: 'oljh igjy nxdk fmzd' // كلمة مرور التطبيق
  }
});

const lastSentTimes = {};
const DELAY_MS = 60 * 1000; // 30 ثانية

app.post('/send', async (req, res) => {
  const { subject, message, email } = req.body;

  if (!subject || !message || !email) {
    return res.status(400).json({ success: false, message: 'البيانات ناقصة' });
  }

  const now = Date.now();

  if (lastSentTimes[email] && now - lastSentTimes[email] < DELAY_MS) {
    const waitTime = Math.ceil((DELAY_MS - (now - lastSentTimes[email])) / 1000);
    return res.status(429).json({
      success: false,
      message: `من فضلك انتظر ${waitTime} ثانية قبل إرسال رسالة أخرى.`
    });
  }

  const mailOptions = {
    from: `"Contact Form" <${email}>`,
    to: 'marawangodey@gmail.com',
    subject: `[Villatrex Contact] ${subject}`,
    text: `📩 رسالة من: ${email}\n\n${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ تم إرسال الرسالة من: ${email}`);

    lastSentTimes[email] = now;

    res.json({ success: true, message: 'تم إرسال الرسالة بنجاح ✅' });
  } catch (error) {
    console.error('❌ خطأ في إرسال الإيميل:', error);
    res.status(500).json({ success: false, message: 'فشل في الإرسال ❌' });
  }
});

app.listen(PORT, () => {
  console.log(`📨 timeserver.js يعمل على http://localhost:${PORT}`);
});
