export const PLANT_CATEGORIES = ['观叶', '观花', '多肉', '蔬菜', '香草', '其他']
export const LOCATIONS = ['阳台', '客厅', '卧室', '庭院', '其他']
export const LIGHT_NEEDS = ['全阳', '半阴', '耐阴']
export const CARE_TYPES = ['浇水', '施肥', '修剪', '换盆', '喷药']
export const BLOOM_STATES = ['未开花', '花苞期', '盛开', '凋谢']

// 连续浇水目标与「坚持 30 天」徽章共用这一个阈值
export const WATERING_STREAK_TARGET = 30

// 徽章定义：target 同时是描述文案、进度展示、解锁判定的唯一阈值来源
// metric 对应 gardenRules.collectAchievementMetrics 返回的度量键
// earnedByPoints 表示该徽章的解锁依赖其他徽章累计积分（园艺大师）
const ACHIEVEMENT_DESCRIPTORS = [
  {
    id: 'first-plant',
    name: '初次种植',
    metric: 'plants',
    target: 1,
    unit: '株',
    points: 10,
    describe: () => '添加第一株植物',
  },
  {
    id: 'plant-five',
    name: '窗台成林',
    metric: 'plants',
    target: 5,
    unit: '株',
    points: 20,
    describe: (target) => `管理 ${target} 株植物`,
  },
  {
    id: 'plant-ten',
    name: '绿意满屋',
    metric: 'plants',
    target: 10,
    unit: '株',
    points: 35,
    describe: (target) => `管理 ${target} 株植物`,
  },
  {
    id: 'green-thumb',
    name: '绿手指',
    metric: 'averageScore',
    target: 80,
    unit: '分',
    points: 30,
    describe: (target) => `平均养护评分达到 ${target}`,
  },
  {
    id: 'watering-rookie',
    name: '准时浇水',
    metric: 'wateringCount',
    target: 5,
    unit: '次',
    points: 20,
    describe: (target) => `完成 ${target} 次浇水记录`,
  },
  {
    id: 'watering-master',
    name: '浇水达人',
    metric: 'wateringCount',
    target: 20,
    unit: '次',
    points: 45,
    describe: (target) => `完成 ${target} 次浇水记录`,
  },
  {
    id: 'fertilizer-care',
    name: '营养师',
    metric: 'fertilizingCount',
    target: 5,
    unit: '次',
    points: 25,
    describe: (target) => `完成 ${target} 次施肥记录`,
  },
  {
    id: 'bloom-garden',
    name: '花开满园',
    metric: 'bloomingPlants',
    target: 3,
    unit: '株',
    points: 35,
    describe: (target) => `记录 ${target} 株开花植物`,
  },
  {
    id: 'growth-watcher',
    name: '生长观察员',
    metric: 'growthRecords',
    target: 10,
    unit: '条',
    points: 25,
    describe: (target) => `记录 ${target} 条生长指标`,
  },
  {
    id: 'plant-doctor',
    name: '植物医生',
    metric: 'pestRecords',
    target: 3,
    unit: '条',
    points: 30,
    describe: (target) => `记录并处理 ${target} 条病虫害`,
  },
  {
    id: 'thirty-day-goal',
    name: '坚持 30 天',
    metric: 'wateringStreak',
    target: WATERING_STREAK_TARGET,
    unit: '天',
    points: 60,
    describe: (target) => `达成连续 ${target} 天按时浇水目标`,
  },
  {
    id: 'garden-master',
    name: '园艺大师',
    metric: 'otherAchievementPoints',
    target: 180,
    unit: '分',
    points: 80,
    earnedByPoints: true,
    describe: (target) => `总积分达到 ${target}`,
  },
]

export const ACHIEVEMENTS = ACHIEVEMENT_DESCRIPTORS.map((item) => ({
  id: item.id,
  name: item.name,
  description: item.describe(item.target),
  metric: item.metric,
  target: item.target,
  unit: item.unit,
  points: item.points,
  earnedByPoints: item.earnedByPoints === true,
}))

export const DEFAULT_GOALS = [
  {
    id: 'goal-30-watering',
    title: '连续30天按时浇水',
    targetDays: WATERING_STREAK_TARGET,
    progressDays: 0,
    completed: false,
  },
]
