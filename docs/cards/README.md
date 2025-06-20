# 卡牌系统详解

《战国》中的卡牌系统是游戏的核心机制，包含多种类型的卡牌，每种都有其独特的功能和使用方式。

## 卡牌类型概览

### [英杰牌](./heroes.md)
- 代表历史人物
- 提供得分目标和特殊能力
- 分为七国所属和无所属两类
- 完成目标可获得分数，未完成则扣分

### [人和牌](./renhe.md)
基础行动牌，分为四类：
1. 军略牌：战争与军事行动
2. 密谋牌：特殊行动与干扰
3. 内政牌：提升国家属性
4. 外交牌：影响国家关系

### [史实牌](./shishi.md)
- 基于历史事件设计
- 效果强大且具有针对性
- 每张牌在游戏中只出现一次
- 通过锦囊市场获得

### [先机牌](./xianji.md)
- 即时性效果
- 通过先机区域获得
- 优先于远谋牌结算

### [远谋牌](./yuanmou.md)
- 长期性效果
- 通过远谋区域获得
- 后于先机牌结算

### [神机牌](./shenqi.md)
- 每位玩家游戏开始时获得1张
- 用于关键时刻的翻盘
- 每回合限用1张

### [天时牌](./tianshi.md)
- 影响整个回合的规则
- 在盟会阶段揭示并结算
- 数量根据玩家人数确定

## 牌堆管理

### 游戏中的牌堆
1. 英杰牌堆（8个）
   - 七国各1个
   - 无所属1个
   - 面朝下放置，不可查看
2. 人和牌堆
   - 面朝下放置
   - 用完时洗混弃牌堆
3. 史实牌堆
   - 面朝下放置
   - 弃牌移出游戏
4. 先机牌堆
   - 面朝下放置
   - 用完不再补充
5. 远谋牌堆
   - 面朝下放置
   - 用完不再补充
6. 天时牌堆
   - 面朝下放置
   - 结算后可查看

### 弃牌堆规则
1. 英杰弃牌堆
   - 面朝上可查看
   - 不会重新使用
2. 人和弃牌堆
   - 面朝上可查看
   - 牌堆用完时重新洗混
3. 史实弃牌堆
   - 面朝上可查看
   - 移出游戏不再使用

## 手牌规则
1. 手牌上限：9张
2. 回合结束时检查上限
3. 超出需要弃牌
4. 人和牌与史实牌分开弃置 