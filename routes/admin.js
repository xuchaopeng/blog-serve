const db = require("../models/db");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const path = require("path");

// 注册
router.post("/api/admin/signUp", (req, res) => {
  //是否重名
  db.User.find({ name: req.body.name }, (err, docs) => {
    if (err) {
      res.send(err);
      return;
    }
    if (docs.length > 0) {
      res.send({ status: 0, msg: "用户名已注册" });
    } else {
      db.User.find({ nickName: req.body.nickName }, (err, docs) => {
        if (err) {
          res.send(err);
          return;
        }
        if (docs.length > 0) {
          res.send({ status: 0, msg: "昵称已注册" });
        } else {
          let newUser = new db.User({
            name: req.body.name,
            password: req.body.password,
            nickName: req.body.nickName,
            avatar: null,
            // type: req.body.type
            type: 2 //1为管理员，2为游客,写死，新建管理员数据库直接改
          });
          newUser.save(function(err) {
            if (err) {
              res.send(err);
            } else {
              res.send({ status: 1, msg: "注册成功" });
            }
          });
        }
      });
    }
  });
});
//登录
router.post("/api/admin/signIn", (req, res) => {
  db.User.find(
    { name: req.body.name, password: req.body.password },
    (err, docs) => {
      if (err) {
        res.send(err);
        return;
      }
      if (docs.length > 0) {
        let content = { name: req.body.name }; // 要生成token的主题信息
        let secretOrPrivateKey = "123456"; // 这是加密的key（密钥）
        let token = jwt.sign(content, secretOrPrivateKey, {
          expiresIn: 60 * 60 * 24 // 24小时过期
        });

        docs[0].token = token;
        db.User(docs[0]).save(function(err) {
          if (err) {
            res.status(500).send();
            return;
          }
          res.send({
            status: 1,
            msg: "登陆成功",
            token: docs[0].token,
            user_name: docs[0]["name"],
            type: docs[0]["type"],
            nickName: docs[0]["nickName"],
            avatar: docs[0]["avatar"]
          });
        });
      } else {
        res.send({ status: 0, msg: "登录失败" });
      }
    }
  );
});
// 退出
router.post("/api/admin/signOut", (req, res) => {
  db.User.find({ token: req.body.token }, (err, docs) => {
    if (err) {
      return;
    }
    if (docs.length > 0) {
      docs[0].token = "";
      db.User(docs[0]).save(function(err) {
        if (err) {
          res.status(500).send();
          return;
        }
        res.send({ status: 1, msg: "退出成功" });
      });
    } else {
      res.send({ status: 0, msg: "退出失败" });
    }
  });
});
// 用户信息更新
router.post("/api/admin/updateUser", (req, res) => {
  db.User.find({ name: req.body.name, token: req.body.token }, (err, docs) => {
    if (err) {
      return;
    }
    if (docs.length > 0) {
      if (req.body.avatar == "null" || req.body.avatar.indexOf("avatar") > -1) {
        //不需更新图片
        docs[0].nickName = req.body.nickName;
        docs[0].avatar = req.body.avatar;
        db.User(docs[0]).save(function(err) {
          if (err) {
            res.status(500).send();
            return;
          }
          res.send({
            status: 1,
            msg: "更新成功",
            user_name: docs[0]["name"],
            type: docs[0]["type"],
            nickName: docs[0]["nickName"],
            avatar: docs[0]["avatar"]
          });
        });
      } else {
        //需要更新图片
        const fs = require("fs");
        let D = Date.now();
        let saveImg = path.join(
          __dirname,
          "../static/upload/avatar/" + D + ".png"
        ); //api.js的上级的static下
        let pathImg = "./static/upload/avatar/" + D + ".png"; //返前台路径目录
        let base64 = req.body.avatar.replace(/^data:image\/\w+;base64,/, "");
        let dataBuffer = new Buffer(base64, "base64"); //把base64码转成buffer对象，
        fs.writeFile(saveImg, dataBuffer, function(err) {
          //用fs写入文件
          if (err) {
            console.log(err);
          } else {
            console.log("写入成功！", saveImg);
            docs[0].nickName = req.body.nickName;
            docs[0].avatar = pathImg;
            db.User(docs[0]).save(function(err) {
              if (err) {
                res.status(500).send();
                return;
              }
              res.send({
                status: 1,
                msg: "更新成功",
                user_name: docs[0]["name"],
                type: docs[0]["type"],
                nickName: docs[0]["nickName"],
                avatar: docs[0]["avatar"]
              });
            });
          }
        });
      }
    } else {
      res.send({ status: 0, msg: "更新失败" });
    }
  });
});
//检测token
router.post("/api/admin/checkUser", (req, res) => {
  db.User.find(
    { name: req.body.user_name, token: req.body.token },
    (err, docs) => {
      if (err) {
        res.send(err);
        return;
      }
      if (docs.length > 0) {
        let token = req.body.token; // 从body或query或者header中获取token
        let secretOrPrivateKey = "123456"; // 这是加密的key（密钥）

        jwt.verify(token, secretOrPrivateKey, function(err, decode) {
          if (err) {
            //  时间失效的时候/ 伪造的token
            res.send({ status: 0 });
          } else {
            res.send({
              status: 1,
              type: docs[0]["type"],
              name: docs[0]["name"],
              avatar: docs[0]["avatar"],
              nickName: docs[0]["nickName"],
              _id: docs[0]["_id"]
            });
          }
        });
      } else {
        res.send({ status: 0 });
      }
    }
  );
});

module.exports = router;
