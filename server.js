const db = require("./db");
const express = require("express");
const path = require("path");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const donationRoutes = require("./routes/donations");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 靜態檔案（styles.css / add-donation.html / js）
app.use(express.static(__dirname));

// 只留一段
app.get(["/add-donation", "/add-donation.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "add-donation.html"));
});

app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
