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
    return res.redirect("/?message=" + encodeURIComponent("No file uploaded"));
  }

  const message = "File uploaded successfully";
  res.redirect("/?message=" + encodeURIComponent(message));
});

app.get("/download/:filename", function (req, res) {
  const filename = req.params.filename;
  const filePath = path.join(publicFolderPath, filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send("Error downloading file");
      }
    });
  } else {
    res.status(404).send("File not found");
  }
});

app.listen(5000, function () {
  console.log("Server created successfully on PORT 5000");
});
