const createError = require("http-errors");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const logger = require("morgan");
const http = require("http");
const https = require("https");
const fs = require("fs");


const admin = require("./routes/admin");
const article = require("./routes/article");
const comment = require("./routes/comment");
const history = require("./routes/history");
const upload = require("./routes/upload");

//链接数据库
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/xu");
const db = mongoose.connection;
db.once("error", () => console.log("Mongo connection error"));
db.once("open", () => console.log("Mongo connection successed"));

const app = express();

//创建http服务器
let httpsOption = {
  key: fs.readFileSync("./https/3968610_xcpeng.cn.key"),
  cert: fs.readFileSync("./https/3968610_xcpeng.cn.pem")
};

app.use(cors()); //跨域
app.use(logger("dev"));
app.use(express.json({ limit: "5mb" }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); //键值对中值为String或Array

//模板
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

//资源
app.use(express.static(path.join(__dirname, "public")));

//路由
app.use(admin);
app.use(article);
app.use(comment);
app.use(upload);
app.use(history);

//404响应
app.use(function(req, res, next) {
  next(createError(404));
});

//错误响应
app.use(function(err, req, res, next) {
  // 设置locals
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  //错误状态
  res.status(err.status || 500);
  res.render("error");
});

//监听服务
http.createServer(app).listen(8090);
https.createServer(httpsOption, app).listen(443);
