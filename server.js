const express = require("express");
const validator = require("validator");
const cors = require("cors");
const dns = require("dns");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/contact", async (req, res) => {
  const { subject, message } = req.body;

  // إيميل ثابت داخليًا (بيمثل الشخص المرسل)
  const email = "marawangodey@gmail.com";

  // تحقق من صيغة الإيميل
  if (!validator.isEmail(email)) {
    return res.status(400).json({ success: false, error: "Internal email is invalid." });
  }

  // تحقق من وجود MX record للدومين
  const domain = email.split("@")[1];
  dns.resolveMx(domain, async (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      return res.status(400).json({ success: false, error: "Email domain does not accept emails." });
    }

    try {
      const response = await fetch("http://localhost:5001/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, message })
      });

      const data = await response.json();
      return res.json(data);
    } catch (e) {
      console.error("Forwarding error:", e.message);
      return res.status(500).json({ success: false, error: "Failed to forward message." });
    }
  });
});

app.listen(port, () => {
  console.log(`Main server running at http://localhost:${port}`);
});
