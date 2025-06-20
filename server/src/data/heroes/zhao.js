const { CardType } = require('../../gamePhases');

// 赵国英雄数据
const zhaoHeroes = [
  {
    id: 'Z054',
    name: '廉颇',
    country: '赵',
    birthDeath: '前327-243',
    type: CardType.HERO,
    score: 8,
    goal: '赵国拥有8枚称霸标记。游戏结束时，赵国每额外拥有2枚称霸标记，你获得1枚贡品标记。',
    description: '赵国名将，与白起、王翦、李牧并称"战国四大名将"。善于用兵，重视防御，曾在长平之战前抵御秦军。因与蔺相如不和，被赵王疏远，后投奔魏国。',
    quote: '廉颇老矣，尚能饭否？——《史记·廉颇蔺相如列传》'
  },
  {
    id: 'Z055',
    name: '赵肃侯',
    country: '赵',
    birthDeath: '?-326',
    type: CardType.HERO,
    score: 8,
    goal: '赵国的政理高于8。',
    description: '赵国守成之君，戎马一生，在狼烟四起的战国兼并战争中，基本保全赵国基业，稳中有升。其果敢与武略为子赵武灵王树立榜样，也为胡服骑射之改革赢得良机。',
    quote: '今上客有意存天下，安诸侯，寡人敬以国从。——《史记·苏秦列传》'
  },
  {
    id: 'Z056',
    name: '赵奢',
    country: '赵',
    birthDeath: '不详',
    type: CardType.HERO,
    score: 3,
    goal: '赵国在一次战争中战胜。明置时，赵国经济+1，且赵括（赵）无法再被明置。',
    description: '赵国名将，因阏与之战战胜秦国，受封马服君。赵括之父，生前认为赵括只能纸上谈兵，不能大用。赵奢死后，赵括为将，果然在长平之战大败于秦军，为秦军所杀。',
    quote: '使赵不将括即已，若必将之，破赵军者必括也！ ——《史记·廉颇蔺相如列传》'
  },
  {
    id: 'Z057',
    name: '公仲连',
    country: '赵',
    birthDeath: '?-400',
    type: CardType.HERO,
    score: 2,
    goal: '赵国执行了行商。',
    description: '赵国相国，帮助赵烈侯进行改革，推荐贤良，连荐牛畜、荀欣、徐越。三人以大道说服赵烈侯放弃赏赐歌者，励精图治。',
    quote: "公仲曰：\"富之可，贵之则否。\"——《史记·赵世家》"
  },
  {
    id: 'Z058',
    name: '赵惠文王',
    country: '赵',
    birthDeath: '310-226',
    type: CardType.HERO,
    score: 10,
    goal: '游戏结束时，赵国国力是全场唯一最高。如果游戏因赵国统一天下结束，你退出得分排名，直接共同获胜。',
    description: '亦称文王。原名赵何，赵武灵王次子，周朝战国时期赵国君主。他善纳忠言，从谏如流。在位时有蔺相如、廉颇、李牧、赵奢等文武大臣，政治清明，武力强大。',
    quote: '三十日不还，则请立太子为王。以绝秦望。王许之。 ——《史记·廉颇蔺相如列传》'
  },
  {
    id: 'Z059',
    name: '李牧',
    country: '赵',
    birthDeath: '280-229',
    type: CardType.HERO,
    score: 2,
    goal: '赵国在与秦国的战争中战胜。明置后，赵国每在战争中战胜一次，你获得1枚贡品标记。',
    description: '赵之良将，与白起、王翦、廉颇并称战国四大名将。李牧驻守代郡、雁门郡期间，率军大破匈奴。在肥之战、番吾之战两次击败秦国，受封武安君。',
    quote: '险绝颇怜今昔地，莫教空说李将军。——苏祐《李牧祠下眺望作》'
  },
  {
    id: 'Z060',
    name: '蔺相如',
    country: '赵',
    birthDeath: '315-260',
    type: CardType.HERO,
    score: 0,
    goal: '你在获得此牌后，必须直接将其明置。游戏结束时，完璧归赵、渑池之会与负荆请罪中，每有一张被打出结算过，你就获得4枚贡品标记。',
    description: '赵国大臣，官至上卿。完璧归赵、渑池之会与负荆请罪这三个典故均源自蔺相如的故事。他对外不辱使命，有理有节；对内保持将相和睦，始终回避忍让，后与廉颇结为刎颈之交。',
    quote: '相如因持璧却立，倚柱，怒发上冲冠。——《史记·廉颇蔺相如列传》'
  },
  {
    id: 'Z061',
    name: '平原君',
    country: '赵',
    birthDeath: '300-251',
    type: CardType.HERO,
    score: 2,
    goal: '赵国参与的一场战争中议和结算成功。明置后，赵国每执行一次变法，你获得1枚贡品标记。',
    description: '赵氏，名胜，赵武灵王之子，赵惠文王的弟弟，是东周战国时期赵国宗室大臣，在赵惠文王和赵孝成王时任宰相，是著名的政治家之一，以善于养士而闻名。战国四公子之一。',
    quote: '买丝绣作平原君，有酒唯浇赵州土。——李贺《浩歌》'
  },
  {
    id: 'Z062',
    name: '赵威后',
    country: '赵',
    birthDeath: '300-265',
    type: CardType.HERO,
    score: 4,
    goal: '赵国政理值于3但未灭亡。明置时，你可以将自己一张未完成的英杰牌放回其所属牌堆的底部。',
    description: '又称赵威太后。惠文王去世后，她一度临朝听政，而年纪才三十出头。史书对她执政时期的作为有两段非常生动的记载，一是"触龙说赵太后"、二是"齐王使使者问赵威后"。',
    quote: '父母之爱子，则为之计深远。 ——《战国策·赵策四》'
  },
  {
    id: 'Z063',
    name: '庞煖',
    country: '赵',
    birthDeath: '不详',
    type: CardType.HERO,
    score: 1,
    goal: '赵国在一次战争中成为援兵的目标。明置后，赵国每在战争中获得援兵并战胜，你获得1枚贡品标记。',
    description: '赵国将领、纵横家，曾擒杀燕将剧辛以及合纵五国伐秦。通兵法、纵横之术。《汉书·艺文志》中兵权谋家有《庞煖》三篇，纵横家中也有《庞煖》二篇。',
    quote: '是庞煖习纵横之术而言兵，为人将帅，殆犀首、甘茂之类也。 ——《先秦诸子系年考辨》'
  },
  {
    id: 'Z064',
    name: '赵括',
    country: '赵',
    birthDeath: '310-260',
    type: CardType.HERO,
    score: 3,
    goal: '赵国在一次战争中战败。明置时，赵国经济-1。且赵奢（赵）无法再被明置。',
    description: '赵国将领。年幼时在其父赵奢的影响下熟读兵书，却无实战经验。长平之战中，赵国用赵括代替廉颇为将。他在长平主动引兵出击，结果被秦军包围，导致四十万赵兵全部被秦坑杀。',
    quote: '括军败，数十万之众遂降秦，秦悉坑之。 ——《史记·廉颇蔺相如列传》'
  },
  {
    id: 'Z065',
    name: '毛遂',
    country: '赵',
    birthDeath: '不详',
    type: CardType.HERO,
    score: 2,
    goal: '回合开始时，你可以明置此牌并获得2枚地利标记。明置后，将此牌交给另一名玩家并视为已完成。',
    description: '赵国邯郸人，为平原君赵胜的门客。秦国围攻邯郸时，平原君准备找二十个文武兼备的门客去楚国，游说楚王合纵抗秦。毛遂便上前自荐。后来脱颖而出，毛遂自荐成为著名的成语。',
    quote: '使遂早得处囊中，乃脱颖而出，非特其末见而已。——《史记·平原君虞卿列传》'
  }
];

module.exports = zhaoHeroes; 