const db = require("../models/db");
const express = require("express");
const router = express.Router();

//评论--新建
router.post("/api/comment/new", (req, res) => {
  db.Article.find({ _id: req.body._id }, (err, docs) => {
    console.log(docs[0],'aaaaaa');
    if (err) {
      return;
    }
    console.log(docs[0],'bbbbbbb');
    let { id, from_uid, from_uname, avatar, content, date } = req.body;
    let obj = { id, from_uid, from_uname, avatar, content, date, child: [] };

    docs[0].comments.push(obj);
    console.log(docs[0],'cccccccc');
    db.Article(docs[0]).save(function(err) {
      if (err) {
        res.status(500).send();
        return;
      }
      res.send({ status: 1, msg: "发表成功" });
    });
  });
});
//评论--回复
router.post("/api/comment/reply", (req, res) => {
  db.Article.find({ _id: req.body._id }, (err, docs) => {
    if (err) {
      return;
    }
    let {
      id,
      from_uid,
      from_uname,
      avatar,
      to_uid,
      to_uname,
      content,
      date
    } = req.body;
    let obj = { from_uid, from_uname, avatar, to_uid, to_uname, content, date };
    let comments = docs[0].comments;

    for (let i = 0; i < comments.length; i++) {
      if (comments[i]["id"] == id) {
        comments[i]["child"].push(obj);
      }
    }
    db.Article(docs[0]).save(function(err) {
      if (err) {
        res.status(500).send();
        return;
      }
      res.send({ status: 1, msg: "回复成功" });
    });
  });
});

module.exports = router;
