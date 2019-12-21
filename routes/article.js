const db = require("../models/db");
const express = require("express");
const common = require("../util/common");
const router = express.Router();

//创建tags
const creatTags = article => {
  const category = article.category;
  const tagem = {
    title: article.title,
    date: article.date,
    _id: article.id
  };
  category.forEach(item => {
    db.Tags.findOne({ name: item }, function(err, res) {
      if (err) return;
      if (!res) {
        let Tag = new db.Tags({
          name: item,
          type: "xcp",
          articles: [tagem],
          total: 1
        });
        Tag.save(function(err) {
          if (err) return;
          console.log("文章tags保存成功");
        });
        return;
      }
      res.name = item;
      if (res.articles.length) {
        res.articles.push(tagem);
      } else {
        res.articles = [tagem];
      }
      res.total ? (res.total += 1) : (res.total = 1);
      db.Tags.update(
        { name: item },
        { articles: res.articles, total: res.total },
        { multi: true },
        function(err, res1) {
          if (err) {
            console.log(err, "保存失败");
            return;
          }
          console.log(res1, "文章tags保存成功");
        }
      );
    });
  });
};
//更新tags
const updateTags = (compare, info) => {
  if (compare.add.length) {
    creatTags({
      title: info.title,
      date: info.date,
      _id: info._id,
      category: compare.add
    });
  }

  if (compare.del.length) {
    compare.del.forEach(item => {
      db.Tags.findOne({ name: item }, function(err, res) {
        if (err) return;
        if (res) {
          oldInfo = res.articles.filter((item, index) => {
            if (item._id == info._id) {
              res.articles.splice(index, 1);
              return true;
            }
          });
          if (!oldInfo.length) return;
          if (oldInfo.length) res.total -= 1;
          db.Tags.update(
            { name: item },
            { articles: res.articles, total: res.total },
            { multi: true },
            function(err, res1) {
              if (err) {
                console.log(err, "删除失败");
                return;
              }
              console.log(res1, "文章tags删除成功");
            }
          );
        }
      });
    });
  }
};
//获取分类接口
router.post("/api/tagList", (req, res) => {
  db.Tags.find({}, (err, data) => {
    if (err) {
      res.send(err);
      return;
    }
    res.send({ status: 200, data: data });
  });
});

//获取所有文章列表
router.post("/api/articleList", (req, res) => {
  db.Article.find({}, (err, data) => {
    if (err) {
      res.send(err);
      return;
    }
    if (req.body.type == "archives") {
      //archives结构
      let arr = [];
      let data_archives = [];

      for (let i = 0; i < data.length; i++) {
        let date = data[i]["date"].slice(0, 4);

        if (arr.indexOf(date) == -1) {
          let obj = {
            type: date,
            list: [
              {
                _id: data[i]["_id"],
                date: data[i]["date"],
                title: data[i]["title"],
                category: data[i]["category"]
              }
            ]
          };
          data_archives.push(obj);
          arr.push(date);
        } else {
          let obj = {
            _id: data[i]["_id"],
            date: data[i]["date"],
            title: data[i]["title"],
            category: data[i]["category"]
          };
          for (let i = 0; i < data_archives.length; i++) {
            if (data_archives[i]["type"] == date) {
              data_archives[i]["list"].push(obj);
            }
          }
        }
      }
      res.send(data_archives);
    } else if (req.body.type == "categories") {
      //categories结构
      let arr = [];
      let data_categories = [];

      for (let i = 0; i < data.length; i++) {
        let cates = data[i]["category"];

        for (let i2 = 0; i2 < cates.length; i2++) {
          if (arr.indexOf(cates[i2]) == -1) {
            let obj = {
              type: cates[i2],
              list: [
                {
                  _id: data[i]["_id"],
                  date: data[i]["date"],
                  title: data[i]["title"],
                  category: data[i]["category"]
                }
              ]
            };
            data_categories.push(obj);
            arr.push(cates[i2]);
          } else {
            let obj = {
              _id: data[i]["_id"],
              date: data[i]["date"],
              title: data[i]["title"],
              category: data[i]["category"]
            };
            for (let i3 = 0; i3 < data_categories.length; i3++) {
              if (data_categories[i3]["type"] == cates[i2]) {
                data_categories[i3]["list"].push(obj);
              }
            }
          }
        }
      }
      res.send(data_categories);
    } else {
      //article结构
      for (let i = 0; i < data.length; i++) {
        data[i]["comments"] = data[i]["comments"].length;
        data[i]["content"] = null;
      }
      res.send(data);
    }
  });
});
// 文章详情页
router.get("/api/articleDetail/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id }, function(err, docs) {
    if (err) {
      console.error(err);
      return;
    }
    let prev = {};
    let next = {};
    docs.read ? docs.read += 1 : docs.read = 1;
    db.Article(docs).save(function(err){
      if(err) {
        console.error(err);
        return;
      }
    })
    db.Article.find({ _id: { $gt: req.params.id } }) //上一条
      .then(res2 => {
        if (res2.length > 0) {
          prev.title = res2[0]["title"];
          prev._id = res2[0]["_id"];
        }
        db.Article.find({ _id: { $lt: req.params.id } }) //下一条
          .then(res3 => {
            if (res3.length > 0) {
              next.title = res3[res3.length - 1]["title"];
              next._id = res3[res3.length - 1]["_id"];
            }
            let obj = JSON.parse(JSON.stringify(docs));
            obj.prev = prev;
            obj.next = next;
            res.send(obj);
          });
      })
      .catch(rej => {
        console.log(rej);
      });
  });
});
//文章保存
router.post("/api/admin/saveArticle", (req, res) => {
  let newArticle = new db.Article(req.body.articleInformation);
  newArticle.save(function(err, article) {
    if (err) {
      res.send(err);
    } else {
      res.send({ status: 1, msg: "保存成功" });
    }
    creatTags(article);
  });
});
// 文章更新
router.post("/api/admin/updateArticle", (req, res) => {
  let info = req.body.articleInformation;
  db.Article.find({ _id: info._id }, (err, docs) => {
    if (err) {
      return;
    }
    const compare = common.compare(docs[0].category, info.category);
    docs[0].title = info.title;
    docs[0].date = info.date;
    docs[0].category = info.category;
    docs[0].gist = info.gist;
    docs[0].content = info.content;
    docs[0].html = info.html;
    db.Article(docs[0]).save(function(err) {
      if (err) {
        res.status(500).send();
        return;
      }
      res.send({ status: 1, msg: "更新成功" });
      updateTags(compare, info);
    });
  });
});
// 文章删除
router.post("/api/admin/deleteArticle", (req, res) => {
  db.Article.findOne({ _id: req.body._id }, function(err, article) {
    if (err) return;
    db.Article.remove({ _id: req.body._id }, (err, c, b) => {
      if (err) {
        res.status(500).send();
        return;
      }
      res.send({ status: 1, msg: "删除成功" });
      updateTags({ add: [], del: article.category }, article);
    });
  });
});
//文章点赞
router.post('/api/article/zan',(req,res) => {
  db.Article.find({_id:req.body._id},(err,docs) => {
    if(err)return;
    if(!docs[0])return;
    docs[0].zan ? docs[0].zan += 1 : docs[0].zan = 1;
    db.Article(docs[0]).save(function(err) {
      if (err) {
        res.status(500).send();
        return;
      }
      res.send({ status: 1, msg: "文章点赞成功" });
    });
  })
})
module.exports = router;
