const fs = require("fs");

module.exports = function(req, res) {
  const con = ["/archive", "/tags", "/a", "/c"];
  const isreset = new RegExp("^" + con.join("|")).test(req.url);
  if (isreset) {
    fs.readFile("./public/index.html", "utf-8", (err, content) => {
      //首页文件位置
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
      });
      if (err) {
        res.end("server no config this URL");
      } else {
        res.end(content);
      }
    })
  }
};
