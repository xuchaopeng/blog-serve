/**
 * 比较两个数组间的差异,返回差异值
 * @param {Arry} ary1
 * @param {Arry} ary2
 * @return {Object} {add:[],del:[]}
 * */
const compare = (ary1, ary2) => {
  let comp = { add: [], del: [] };
  ary1.forEach(item => {
    if (ary2.indexOf(item) == -1) {
      comp.del.push(item);
    }
  });
  ary2.forEach(item => {
    if (ary1.indexOf(item) == -1) {
      comp.add.push(item);
    }
  });
  return comp;
};

const common = {
    compare
}


module.exports = common;
