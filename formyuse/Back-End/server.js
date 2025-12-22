const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

// 1. AUTO-CREATE UPLOADS FOLDER (Prevents ENOENT Error)
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created 'uploads' directory automatically.");
}

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadDir));

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://nandha:123nandha@cluster0.lqtgmgv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0s")
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Schema
const FileSchema = new mongoose.Schema({
  name: String,
  path: String,
  type: String,
  size: Number,
  createdAt: { type: Date, default: Date.now },
});
const File = mongoose.model("File", FileSchema);

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// API Routes
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded.");

    const newFile = new File({
      name: req.file.originalname,
      path: req.file.filename,
      type: req.file.mimetype,
      size: req.file.size,
    });
    await newFile.save();
    res.json(newFile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/files", async (req, res) => {
  const files = await File.find().sort({ createdAt: -1 });
  res.json(files);
});

app.delete("/files/:id", async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);
    if (file) {
      const filePath = path.join(__dirname, "uploads", file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
