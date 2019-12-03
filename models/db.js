const mongoose = require("mongoose");

//管理员
const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  nickName: String,
  type: String, //1管理员，2游客
  token: String,
  avatar: String
});
//文章
const articleSchema = new mongoose.Schema({
  title: String,
  date: String,
  category: Array,
  gist: String,
  content: String,
  comments: Array,
  read:Number
});
//demo
const demoSchema = new mongoose.Schema({
  title: String,
  date: String,
  file: String,
  pic: String,
  gist: String
});
//标签
const tagSchema = new mongoose.Schema({
  name: String,
  type: String,
  articles: [mongoose.Schema.Types.Mixed],
  total: Number
});

const Models = {
  User: mongoose.model("User", userSchema),
  Article: mongoose.model("Article", articleSchema),
  Demo: mongoose.model("Demo", demoSchema),
  Tags: mongoose.model("Tags", tagSchema)
};

module.exports = Models;
