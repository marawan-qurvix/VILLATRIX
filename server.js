const express = require("express");
const validator = require("validator");
const cors = require("cors");
const dns = require("dns");
const fetch = require("node-fetch"); // تأكد إنها مثبّتة أو استخدم native fetch لو Node 18+

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("🚀 Villatrex Main Server is running.");
});

app.post("/contact", async (req, res) => {
  const { subject, message } = req.body;

  // إيميل ثابت داخليًا (بيمثلك كمُرسل)
  const email = "marawangodey@gmail.com";

  if (!validator.isEmail(email)) {
    return res.status(400).json({ success: false, error: "Internal email is invalid." });
  }

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
      res.json(data);
    } catch (e) {
      console.error("❌ Error forwarding to timeserver:", e.message);
      res.status(500).json({ success: false, error: "Failed to forward message." });
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Main server is running on http://localhost:${PORT}`);
});
 