const qiHeroes = require('./qi');
const chuHeroes = require('./chu');
const yanHeroes = require('./yan');
const hanHeroes = require('./han');
const zhaoHeroes = require('./zhao');
const weiHeroes = require('./wei');
const qinHeroes = require('./qin');
const independentHeroes = require('./independent');
// TODO: 其他国家的英雄数据
// const qinHeroes = require('./qin');

// 合并所有英雄数据
const heroCards = [
  ...qiHeroes,
  ...chuHeroes,
  ...yanHeroes,
  ...hanHeroes,
  ...zhaoHeroes,
  ...weiHeroes,
  ...qinHeroes,
  ...independentHeroes
];

module.exports = {
  heroCards,
  qiHeroes,
  chuHeroes,
  yanHeroes,
  hanHeroes,
  zhaoHeroes,
  weiHeroes,
  qinHeroes,
  independentHeroes
}; 