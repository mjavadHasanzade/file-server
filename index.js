const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const publicFolderPath = path.join(__dirname, "public");
const storage = multer.diskStorage({
  destination: publicFolderPath,
  filename: function (req, file, cb) {
    const originalName = file.originalname;
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    const timestamp = Date.now();
    const uniqueName = baseName + "-" + timestamp + ext;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

app.get("/", function (req, res) {
  fs.readdir(publicFolderPath, function (err, files) {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading files");
    }

    res.render("fileList", { files, message: req.query.message });
  });
});

app.post("/upload", upload.single("file"), function (req, res) {
  if (!req.file) {
    return res.json({ message: "No file uploaded" });
  }

  const message = "File uploaded successfully";
  res.json({ message });
});

app.get("/download/:filename", function (req, res) {
  const filename = req.params.filename;
  const filePath = path.join(publicFolderPath, filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, filename, function (err) {
      if (err) {
        console.error(err);
        if (!res.headersSent) {
          // Check if headers have already been sent
          return res.status(500).send("Error downloading file");
        }
      }
    });
  } else {
    return res.status(404).send("File not found");
  }
});

const { networkInterfaces } = require("os");

const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
    const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
    if (net.family === familyV4Value && !net.internal) {
      if (!results[name]) {
        results[name] = [];
      }
      results[name].push(net.address);
    }
  }
}

console.log(results);

app.listen(80, function () {
  console.log(
    `Server created successfully on http://${results["Wi-Fi"][0]}:80`
  );
});
