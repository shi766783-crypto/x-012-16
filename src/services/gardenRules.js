import { ACHIEVEMENTS } from '../constants/garden'
import { daysBetween, monthOf, todayISO } from '../utils/date'

export function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function getWateringStatus(plant, today = todayISO()) {
  const lastWatered = plant.lastWateredDate || plant.purchaseDate || today
  const elapsed = daysBetween(lastWatered, today)
  const frequency = Number(plant.wateringFrequency) || 1

  if (elapsed === 0) return '已浇水'
  if (elapsed < frequency) return '已浇水'
  if (elapsed === frequency) return '待浇水'
  return '已过期'
}

export function getDueWateringPlants(plants, today = todayISO()) {
  return plants
    .map((plant) => ({ ...plant, wateringStatus: getWateringStatus(plant, today) }))
    .filter((plant) => plant.wateringStatus === '待浇水' || plant.wateringStatus === '已过期')
    .sort((a, b) => statusWeight(b.wateringStatus) - statusWeight(a.wateringStatus))
}

export function getDashboard(plants, careRecords, growthRecords) {
  const currentMonth = monthOf(todayISO())
  const alivePlants = plants.filter((plant) => plant.alive !== false)
  const duePlants = getDueWateringPlants(plants)
  const monthlyFertilizing = careRecords.filter(
    (record) => record.type === '施肥' && monthOf(record.date) === currentMonth,
  ).length
  const survivalRate = plants.length ? Math.round((alivePlants.length / plants.length) * 100) : 100
  const averageScore = calculateAverageCareScore(plants, careRecords, growthRecords)

  return {
    totalPlants: plants.length,
    dueWatering: duePlants.length,
    monthlyFertilizing,
    survivalRate,
    averageScore,
  }
}

export function buildTimeline(plantId, careRecords, growthRecords, pestRecords) {
  const careItems = careRecords
    .filter((record) => record.plantId === plantId)
    .map((record) => ({
      id: record.id,
      date: record.date,
      title: record.type,
      detail: record.note || record.amount || '已记录养护操作',
      photo: record.photo,
    }))
  const growthItems = growthRecords
    .filter((record) => record.plantId === plantId)
    .map((record) => ({
      id: record.id,
      date: record.date,
      title: '生长指标',
      detail: `高度 ${record.height || 0} cm，叶片 ${record.leafCount || 0} 片，${record.bloomState}`,
    }))
  const pestItems = pestRecords
    .filter((record) => record.plantId === plantId)
    .map((record) => ({
      id: record.id,
      date: record.date,
      title: '病虫害记录',
      detail: `${record.symptom}；${record.recovery || '恢复情况待观察'}`,
    }))

  return [...careItems, ...growthItems, ...pestItems].sort((a, b) => b.date.localeCompare(a.date))
}

// 汇总徽章所依赖的全部度量值；解锁判定与徽章进度展示都只读这一份数据
export function collectAchievementMetrics(plants, careRecords, growthRecords, pestRecords) {
  const wateringCount = careRecords.filter((record) => record.type === '浇水').length
  const fertilizingCount = careRecords.filter((record) => record.type === '施肥').length
  const bloomingPlants = new Set(
    growthRecords.filter((record) => record.bloomState === '盛开').map((record) => record.plantId),
  ).size
  const dashboard = getDashboard(plants, careRecords, growthRecords)

  return {
    plants: plants.length,
    wateringCount,
    fertilizingCount,
    bloomingPlants,
    averageScore: dashboard.averageScore,
    growthRecords: growthRecords.length,
    pestRecords: pestRecords.length,
    wateringStreak: getCurrentWateringStreak(careRecords),
  }
}

export function calculateAchievements(plants, careRecords, growthRecords, pestRecords) {
  const metrics = collectAchievementMetrics(plants, careRecords, growthRecords, pestRecords)

  // 园艺大师的阈值按其他徽章累计积分计算，先算出直接徽章的解锁结果
  const directAchievements = ACHIEVEMENTS.filter((item) => !item.earnedByPoints)
  const directEarnedIds = new Set(
    directAchievements
      .filter((item) => metrics[item.metric] >= item.target)
      .map((item) => item.id),
  )
  const otherAchievementPoints = directAchievements
    .filter((item) => directEarnedIds.has(item.id))
    .reduce((sum, item) => sum + item.points, 0)

  const allMetrics = { ...metrics, otherAchievementPoints }
  const earnedIds = new Set(directEarnedIds)
  for (const item of ACHIEVEMENTS) {
    if (item.earnedByPoints && otherAchievementPoints >= item.target) earnedIds.add(item.id)
  }

  const earned = ACHIEVEMENTS.filter((item) => earnedIds.has(item.id))
  const points = earned.reduce((sum, item) => sum + item.points, 0)
  const badges = ACHIEVEMENTS.map((item) => ({
    ...item,
    current: allMetrics[item.metric] ?? 0,
    earned: earnedIds.has(item.id),
  }))

  return { earned, points, badges }
}

export function getCurrentWateringStreak(careRecords) {
  const wateringDates = [
    ...new Set(
      careRecords.filter((record) => record.type === '浇水').map((record) => record.date),
    ),
  ]
  return countCurrentStreak(wateringDates)
}

export function updateWateringGoal(goals, careRecords) {
  const streak = getCurrentWateringStreak(careRecords)

  return goals.map((goal) => {
    if (goal.id !== 'goal-30-watering') return goal
    return {
      ...goal,
      progressDays: Math.min(streak, goal.targetDays),
      completed: streak >= goal.targetDays,
    }
  })
}

export function buildLeaderboards(plants, careRecords, growthRecords) {
  const groups = plants.map((plant) => {
    const plantCare = careRecords.filter((record) => record.plantId === plant.id)
    const plantGrowth = growthRecords.filter((record) => record.plantId === plant.id)
    const completeness = Math.min(100, plantCare.length * 8 + plantGrowth.length * 10)
    const survival = plant.alive === false ? 0 : 100
    return {
      id: plant.id,
      name: plant.name,
      score: Math.round(survival * 0.6 + completeness * 0.4),
      blooms: plantGrowth.filter((record) => record.bloomState === '盛开').length,
    }
  })

  return {
    gardenExperts: [...groups].sort((a, b) => b.score - a.score).slice(0, 5),
    bloomLeaders: [...groups].sort((a, b) => b.blooms - a.blooms).slice(0, 5),
  }
}

function calculateAverageCareScore(plants, careRecords, growthRecords) {
  if (!plants.length) return 100
  const scores = plants.map((plant) => {
    const status = getWateringStatus(plant)
    const statusScore = status === '已过期' ? 45 : status === '待浇水' ? 75 : 95
    const recordScore = Math.min(100, careRecords.filter((record) => record.plantId === plant.id).length * 12)
    const growthScore = Math.min(100, growthRecords.filter((record) => record.plantId === plant.id).length * 18)
    return Math.round(statusScore * 0.55 + recordScore * 0.3 + growthScore * 0.15)
  })
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
}

function countCurrentStreak(wateringDates) {
  let cursor = todayISO()
  let streak = 0
  const dates = new Set(wateringDates)

  while (dates.has(cursor)) {
    streak += 1
    const date = new Date(`${cursor}T00:00:00`)
    date.setDate(date.getDate() - 1)
    cursor = date.toISOString().slice(0, 10)
  }

  return streak
}

function statusWeight(status) {
  return status === '已过期' ? 2 : status === '待浇水' ? 1 : 0
}
