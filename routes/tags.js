const db = require('../models/db');
const express = require('express');
const router = express.Router();

//分类标签添加
router.get('/api/tag/add', (req, res) => {
  const param = req.query;
  const tag = param.tag || '';
  if (!tag) {
    res.send({ msg: '添加失败,标签分类不能为空' });
    return;
  }
  db.TagClass.find({}, function (err, r) {
    if (err) {
      res.send({ msg: '服务器异常', data: null });
      return;
    }
    let onts = r[0];
    if (!onts) onts = { data: [], total: 0 };
    if (onts.data.indexOf(tag) > -1) res.send({ msg: '标签分类已存在' });
    else {
      onts.data.push(tag);
      onts.total += 1;
      //新建保存
      if (!r[0]) {
        let newsone = new db.TagClass(onts);
        newsone.save(function (error, item) {
          if (error) {
            res.send({ msg: '标签分类添加失败' });
            return;
          }
          res.send({ msg: '标签分类添加成功' });
        });
      } else {
        db.TagClass.update(
          { _id: onts._id },
          { data: onts.data, total: onts.total },
          { multi: true },
          function (e, s) {
            if (e) {
              res.send({ msg: '标签分类添加失败' });
              return;
            }
            res.send({ msg: '标签分类添加成功' });
          }
        );
      }
    }
  });
});

//分类标签删除
router.get('/api/tag/remove', (req, res) => {
  const param = req.query;
  const tag = param.tag || '';
  if (!tag) {
    res.send({ msg: '标签不能为空', code: 401 });
    return;
  }
  db.TagClass.find({}, function (err, r) {
    if (err) {
      res.send({ msg: '服务器异常', data: 500 });
      return;
    }
    if (!r.length) res.send({ msg: '分类成功删除', code: 200 });
    else {
      let arr = r[0].data;
      arr.splice(
        arr.findIndex((item) => item === tag),
        1
      );
      db.TagClass.update(
        { _id: r[0]._id },
        { data: arr, total: r[0].total - 1 },
        { multi: true },
        function (e, s) {
          if (e) {
            res.send({ msg: '标签分类删除失败', code: 500 });
            return;
          }
          res.send({ msg: '标签分类删除成功', code: 200 });
        }
      );
    }
  });
});

//分类标签获取
router.get('/api/tag/get', (req, res) => {
  db.TagClass.find({}, function (err, r) {
    if (err) {
      res.send({ msg: '服务器异常', data: null });
      return;
    }
    if (r.length) res.send({ msg: '成功', data: r[0] });
    else res.send({ msg: '成功', data: null });
  });
});

module.exports = router;