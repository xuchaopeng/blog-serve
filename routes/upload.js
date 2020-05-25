const express = require("express");
const router = express.Router();
const formidable = require("formidable");
const datetime = require("silly-datetime");
const fs = require("fs");
const path = require("path");

router.post("/api/upload", function (req, res) {
  let form = new formidable.IncomingForm();
  let filepath;
  let filename;
  form.encoding = "utf-8"; // 编码
  form.keepExtensions = true;
  form.uploadDir = path.join(__dirname, "../public/images/");

  form.on("file", (name, file) => {
    filepath = file.path;
    filename = file.name;
  });

  form.parse(req, (err) => {
    if (err) return next(err);
  });

  form.on("end", () => {
    const time = datetime.format(new Date(), "YYYYMMDDHHmmss");
    const num = parseInt(Math.random() * 100000);
    const extname = path.extname(filename);
    const fileNewName = time + num + extname;
    const oldname = filepath;
    const newname = form.uploadDir + fileNewName;
    fs.rename(oldname, newname, (err) => {
      if (err) {
        res.json({ code: 200, data: { name: fileNewName, path: newname } });
      } else {
        res.json({ code: 200, data: { name: fileNewName, path: newname } });
      }
    });

  });
});

module.exports = router;
