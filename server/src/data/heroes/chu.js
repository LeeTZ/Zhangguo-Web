const { CardType } = require('../../gamePhases');

// 楚国英雄数据
const chuHeroes = [
  {
    id: 'C014',
    name: '楚威王',
    country: '楚',
    birthDeath: '前370-329',
    type: CardType.HERO,
    score: 10,
    goal: '楚国的经济比其他所有国家都至少高4，并拥有至少3枚称霸标记。',
    description: '楚国的中兴之主。他一生以恢复楚庄王时代的霸业为志，在位期间，楚国的疆域达到了最大规模。囊括了长江中下游以及支流众多的淮河流域。',
    quote: '楚，天下之强国也；王，天下之贤王也。 —— 《史记·苏秦列传》'
  },
  {
    id: 'C015',
    name: '吴起',
    country: '楚',
    birthDeath: '前440-381',
    type: CardType.HERO,
    score: 8,
    goal: '楚国在一场战争中，战争另一方获得了至少两次援兵，而楚国最终战胜。',
    description: '兵家代表人物，在内政、军事上都有极高的成就。在楚国期间实施变法，使楚国力强盛，疆土向南大扩。著有《吴子兵法》。',
    quote: '文侯以吴起善用兵，廉平，尽能得士心，乃以为西河守，以拒秦、韩。 ——《史记·孙子吴起列传》'
  },
  {
    id: 'C016',
    name: '屈原',
    country: '楚',
    birthDeath: '前340-278',
    type: CardType.HERO,
    score: 2,
    goal: '楚辞被打出结算。若你是在其打出的同一回合明置的此牌，获得2枚贡品标记。游戏结束时，若郑袖（楚）和子兰（楚）无人明置，获得1枚贡品标记。',
    description: '有楚国第一诗人的美称，任三闾大夫。因楚王听信谗言，被流放于江南地区。十八年间，屈原广泛地接触了人民群众和丰富生动的楚国民间文化，留下了千古不朽的绝唱《离骚》。',
    quote: '路漫漫其修远兮，吾将上下而求索。 ——《离骚》'
  },
  {
    id: 'C017',
    name: '昭阳',
    country: '楚',
    birthDeath: '不详',
    type: CardType.HERO,
    score: 6,
    goal: '楚国在一场战争中击败魏国，且最终战力值差至少为4点。',
    description: '楚国令尹，在襄陵之战大败魏国，得到八个城邑，威震六国。为此，楚烈王也以周穆王"八骏"之一，美称为"山子"的良马名为谥号，赐给昭阳，故后人称昭阳为"山子府君"。',
    quote: '六年，楚使柱国昭阳将兵而攻魏，破之於襄陵，得八邑。——《史记·楚世家》'
  },
  {
    id: 'C018',
    name: '庄蹻',
    country: '楚',
    birthDeath: '不详',
    type: CardType.HERO,
    score: 2,
    goal: '楚国在一场战争中战败。',
    description: '垂沙之战后，庄蹻率军叛变，一度攻下楚国国都郢，史称"庄蹻暴郢"。后受招抚成为楚将。楚襄王时，庄蹻以武力平定西南，因归路断绝，遂留在滇池建立滇国，自立为滇王。',
    quote: '故齐之田单，楚之庄蹻，秦之卫鞅，燕之缪虮，是皆世俗所谓善用兵者也。——《荀子·议兵篇》'
  },
  {
    id: 'C019',
    name: '项羽',
    country: '楚',
    birthDeath: '前232-202',
    type: CardType.HERO,
    score: 10,
    goal: '游戏结束时，楚国国力是全场唯一最高。如果游戏因楚国统一天下结束，你退出得分排名，直接共同获胜。',
    description: '秦末农民起义领袖，勇猛好武。巨鹿之战中，领军灭亡秦国。自称西楚霸王，定都于彭城。楚汉之争中，最终因刚愎自用，猜疑亚父范增，终为刘邦所败，于垓下遭遇十面埋伏，自刎于乌江旁。',
    quote: '力拔山兮气盖世，时不利兮骓不逝。 —— 项羽《垓下歌》'
  },
  {
    id: 'C020',
    name: '项燕',
    country: '楚',
    birthDeath: '前300-223',
    type: CardType.HERO,
    score: 2,
    goal: '秦国灭亡。获得8枚贡品标记。每次秦国复辟成功，你都失去2枚贡品标记（不限于此牌获得的）。',
    description: '楚国大将军，是抗秦将领项梁之父，西楚霸王项羽的祖父。在秦灭楚之战中，项燕曾大败秦将李信，但不久之后被王翦击破，兵败自杀。',
    quote: '项燕为楚将，数有功，爱士卒，楚人怜之。——《史记·陈涉世家》'
  },
  {
    id: 'C021',
    name: '楚怀王',
    country: '楚',
    birthDeath: '?-296',
    type: CardType.HERO,
    score: 2,
    goal: '楚国灭亡。获得8枚贡品标记。每次楚国复辟成功，你都失去2枚贡品标记（不限于此牌获得的）。',
    description: '楚国国君，任用佞臣令尹子兰、上官大夫靳尚，宠爱南后郑袖，排斥左徒大夫屈原，为人利令智昏，国事日非。最后被秦昭王所骗，监禁于秦国至死。',
    quote: '六里江山天下笑，张仪容易去还来。——崔道融《楚怀王》'
  },
  {
    id: 'C022',
    name: '春申君',
    country: '楚',
    birthDeath: '前300-238',
    type: CardType.HERO,
    score: 4,
    goal: '楚国经济为全场最高，且拥有至少2枚称霸标记。',
    description: '原名黄歇，曾任楚相。 战国四公子之一。他游学博闻，善辩。楚考烈王赐其淮河以北十二县，封为春申君。六国联军讨伐秦国时，楚考烈王担任六国盟约首脑，春申君当权主事。',
    quote: '当时珠履三千客，赵使怀惭不敢言。——张继《春申君祠》'
  },
  {
    id: 'C023',
    name: '靳尚',
    country: '楚',
    birthDeath: '不详-311',
    type: CardType.HERO,
    score: 4,
    goal: '楚国经济低于2，但未灭亡。',
    description: '楚怀王时，与三闾大夫屈原为同僚，受封于靳江，世称靳尚。史书往往将靳尚刻画为一个小人，一说靳尚就是排挤屈原的上官大夫，但存疑。',
    quote: '同列大夫上官、靳尚，妒害其能，共谮毁之。 ——王逸《离骚经序》'
  },
  {
    id: 'C024',
    name: '宋玉',
    country: '楚',
    birthDeath: '不详',
    type: CardType.HERO,
    score: 6,
    goal: '楚国政理高于9，或其政理比所有其他国家高至少3。',
    description: '楚国辞赋家，为屈原之后最杰出的楚辞作家，后世常将两人合称为"屈宋"。与潘安、兰陵王、卫玠有中国古代四大美男之称。',
    quote: '摇落深知宋玉悲，风流儒雅亦吾师。——杜甫《咏怀古迹五首·其二》'
  },
  {
    id: 'C025',
    name: '子兰',
    country: '楚',
    birthDeath: '不详',
    type: CardType.HERO,
    score: 4,
    goal: '楚国政理低于3，但未灭亡。',
    description: '楚怀王的儿子。楚怀王要与秦昭襄王会盟，屈原极力反对，而子兰极力赞成，最后怀王听从了子兰的意见，到秦国却被扣留，直到死去。后子兰与上官大夫诬陷屈原，使屈原被流放。',
    quote: '怀王子子兰劝王行，曰："柰何绝秦之驩心!" ——《史记·楚世家》'
  },
  {
    id: 'C026',
    name: '郑袖',
    country: '楚',
    birthDeath: '不详',
    type: CardType.HERO,
    score: 0,
    goal: '当其他玩家明置一张英杰牌时，其结算前，你可以明置此牌，弃置至多X个贡品标记，然后弃置该玩家相同数量的贡品标记。X为该英杰牌的基础得分。',
    description: '善妒狡黠、阴险恶毒、极有心计。郑袖干涉朝政，收受贿赂，勾结靳尚，陷害屈原，致使屈原被放逐；放走张仪，让楚国终至败亡。',
    quote: '怀王以不知忠臣之分，故内惑于郑袖，外欺于张仪。 ——《史记·屈原列传》'
  }
];

module.exports = chuHeroes; 