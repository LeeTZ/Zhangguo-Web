const { CardType } = require('../../gamePhases');

// 齐国英雄数据
const qiHeroes = [
    // 齐国英雄
    {
      id: 'Q001',
      name: '齐威王',
      country: '齐',
      birthDeath: '前378-320',
      type: CardType.HERO,
      score: 10,
      goal: '同一回合内，齐国国力（三项属性和）增加超过6。明置时，齐国额外获得1枚称霸标记。',
      description: '以善于纳谏用能，励志图强而名著史册。行改革，明法制、选贤能、明赏罚、国力日强。在位初期沈湎不治，但后来一鸣惊人，王威三十六年。',
      quote: '此鸟不蜚则已，一蜚冲天；不鸣则已，一鸣惊人。 ——《史记·滑稽列传》'
    },
    {
      id: 'Q002',
      name: '匡章',
      country: '齐',
      birthDeath: '前335-295',
      type: CardType.HERO,
      score: 8,
      goal: '齐国拥有至少8枚称霸标记。',
      description: '齐威王、齐宣王、齐湣王三朝名将。北伐燕，几乎灭掉燕国；南征楚，垂沙之战重创楚军，使楚国国力大衰；西攻函谷关，逼迫秦国割地求和。为齐立下赫赫战功。',
      quote: '章子可谓知将分矣。——《吕氏春秋》'
    },
    {
      id: 'Q003',
      name: '邹忌',
      country: '齐',
      birthDeath: '不详',
      type: CardType.HERO,
      score: 6,
      goal: '齐国政理高于7。明置时，齐国额外获得1枚称霸标记。',
      description: '齐威王时为相，封于下邳，号成侯。后又事齐宣王。邹忌时期，齐国先后取得了桂陵之战、桑丘之战、马陵之战等胜利。邹忌讽劝齐王纳谏除弊，徐州相王后，多国朝于齐国。',
      quote: '邹忌修八尺有余，而形貌昳丽。 —— 《战国策·齐策一》'
    },
    {
      id: 'Q004',
      name: '田忌',
      country: '齐',
      birthDeath: '不详',
      type: CardType.HERO,
      score: 4,
      goal: '齐国一项属性为全场最高，同时另一项属性全场最低。明置时，你可以将最低的属性提高1点。',
      description: '齐国公子。孙膑逃亡到齐国时，田忌赏识孙膑的才能，收为门客。在一次赛马时，孙膑向田忌提出了以下马对上马，以上马对中马，以中马对下马的策略，即著名的"田忌赛马"。',
      quote: '今以君之下驷彼上驷，取君上驷与彼中驷，取君中驷与彼下驷。 ——《史记·孙子吴起列传》'
    },
    {
      id: 'Q005',
      name: '齐宣王',
      country: '齐',
      birthDeath: '前350-301',
      type: CardType.HERO,
      score: 2,
      goal: '齐国在战争中战胜燕国。游戏结束时，若稷下之学被打出，获得1枚贡品标记。',
      description: '齐威王之子。在位时有两大事迹：两月灭燕，百家争鸣。灭燕为之后燕昭王的复仇埋下伏笔，而稷下学宫的发扬光大则带来了先秦的百家争鸣盛景。',
      quote: '王顾左右而言他。 ——《孟子·梁惠王下》'
    },
    {
      id: 'Q006',
      name: '齐湣王',
      country: '齐',
      birthDeath: '前323-284',
      type: CardType.HERO,
      score: 10,
      goal: '游戏结束时，齐国国力是全场唯一最高。如果游戏因齐国统一天下结束，你退出得分排名，直接共同获胜。',
      description: '齐国国君，在位十七年，屡建武功。吞并富有的宋国，自称东帝，四面树敌，最终招致后来五国合纵攻齐，齐国几近灭国的悲惨报复。',
      quote: '宣王使人吹竽，必三百人。南郭处士请为王吹竽，宣王说之。湣王立，好一一听之，处士逃。 ——《韩非子·内储说上七术》'
    },
    {
      id: 'Q007',
      name: '孙膑',
      country: '齐',
      birthDeath: '不详',
      type: CardType.HERO,
      score: 8,
      goal: '齐国在一场战争中获得庙算加成，及至少两次援兵并最终战胜。',
      description: '军事家，是孙武的后代，因受过膑刑故称孙膑。曾与庞涓同窗学艺于鬼谷子。后被齐威王任命为军师，辅佐田忌两次击败庞涓，取得桂陵之战和马陵之战的胜利，奠定了齐国的霸业。',
      quote: "孙子曰：'夫解杂乱纷纠者不控卷，救斗者不搏撠。批亢捣虚，形格势禁，则自为解耳。' ——《史记·孙子吴起列传》"
    },
    {
      id: 'Q008',
      name: '田单',
      country: '齐',
      birthDeath: '不详',
      type: CardType.HERO,
      score: 8,
      goal: '在齐国打出的复辟结算成功。',
      description: '齐国名将，为齐国远房宗室。在乐毅率领五国军队，攻打齐国危亡之际，田单坚守即墨，以火牛阵大破燕军，收复失地七十余城，复兴齐国。后被拜为相国，封为安平君。',
      quote: '夫始如处女，适人开户；后如脱兔，适不及距：其田单之谓邪！ ——《史记·田单列传》'
    },
    {
      id: 'Q009',
      name: '孟尝君',
      country: '齐',
      birthDeath: '不详-279',
      type: CardType.HERO,
      score: 6,
      goal: '你已经明置了三个不同国家的英杰牌，且其中有魏国的英杰牌。',
      description: '名田文，战国四公子之一。以广招宾客，食客三千闻名。对所有人才不分贵贱，一视同仁，门下食客也多为"鸡鸣狗盗"之辈。因功高震主，天下知有孟尝君而不知齐王，晚年逃到魏国。',
      quote: '孟尝君招致天下任侠，奸人入薛中盖六万余家矣。 ——《史记·孟尝君列传》'
    },
    {
      id: 'Q010',
      name: '冯谖',
      country: '齐',
      birthDeath: '不详',
      type: CardType.HERO,
      score: 2,
      goal: '冯谖客孟尝君被打出结算。若你是在其打出的同一回合明置的此牌，获得2枚贡品标记。',
      description: '孟尝君门下食客之一，他"弹铗而歌"，向孟尝君索取了不少待遇后，以"焚券市义"树立了孟尝君的威信；又帮孟尝君营造"狡兔三窟"；在孟尝君遭齐王猜忌时，游说国君，使之威名重立。为孟尝君立下了汗马功劳。',
      quote: '狡兔有三窟，仅得免其死耳；今君有一窟，未得高枕而卧也。请为君复凿二窟。 —— 《战国策·齐策四》'
    },
    {
      id: 'Q011',
      name: '陈轸',
      country: '齐',
      birthDeath: '不详',
      type: CardType.HERO,
      score: 6,
      goal: '韩国与魏国战争，且此时秦国的政理值高于6并拥有至少2枚称霸标记。',
      description: '纵横家。曾游说入秦，受秦惠文王礼待，后来韩魏相争，他又献策秦王，坐视其两败俱伤，以便乘机取利。善于以讲故事的方式游说，一些脍炙人口的成语便由此而来，如画蛇添足、卞庄刺虎、计赚两虎。',
      quote: '为蛇足者，终亡其酒。战无不胜，而不知止者，身且死，爵且后归，犹为蛇足也。 —— 《战国策·齐策二》'
    },
    {
      id: 'Q012',
      name: '淳于髡',
      country: '齐',
      birthDeath: '不详',
      type: CardType.HERO,
      score: 4,
      goal: '同一回合内，至少3张史实事件被结算。',
      description: '齐国的政治家和思想家，以博学多才、滑稽多辩著称，杯盘狼藉、堕珥遗簪、乐极生悲、一鸣惊人等成语与其有关。齐威王拜其为政卿大夫。',
      quote: '淳于髡者，齐之赘婿也。长不满七尺，滑稽多辩，数使诸侯，未尝屈辱。 ——《史记·滑稽列传》'
    },
    {
      id: 'Q013',
      name: '城北徐公',
      country: '齐',
      birthDeath: '不详',
      type: CardType.HERO,
      score: 0,
      goal: '当其他玩家明置一张英杰牌时，其结算前，你可以明置此牌，弃置至多X枚地利标记，然后获得相同数量的贡品标记。X为该英杰牌的基础得分。',
      description: '出自《战国策·齐策》中"邹忌讽齐王纳谏" 一章。是齐国姓徐的美男子，邹忌比美的对象，后来也作美男子的代称。',
      quote: '明日徐公来，孰视之，自以为不如；窥镜而自视，又弗如远甚。 —— 《战国策·齐策一》'
    }
  ];

module.exports = qiHeroes; 