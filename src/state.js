// 状態：習慣の配列（このアプリの"何を登録したか"を表す唯一の情報源）
export const routines = []

// 習慣を追加する
export function addRoutine(title, days) {
  const routine = {
    id: Date.now().toString(),
    title,
    days,
    createdAt: new Date().toISOString(),
  }
  routines.push(routine)
  saveState()
  return routine
}

const MAX_TITLE_LENGTH = 20

// 入力が正しいか確認する。問題があればエラーメッセージの配列を返す（問題なければ空配列）
export function validateRoutine(title, days) {
  const errors = []
  const trimmedTitle = title.trim()

  if (trimmedTitle === '' || trimmedTitle.length > MAX_TITLE_LENGTH) {
    errors.push('やることを入れてね')
  }

  if (days.length === 0) {
    errors.push('曜日を1つ以上選んでね')
  }

  if (routines.some((routine) => routine.title === trimmedTitle)) {
    errors.push('その習慣はもう登録されてるで')
  }

  return errors
}

// 今日の曜日（0=日〜6=土）に該当する習慣だけを返す
export function todayRoutines() {
  const today = new Date().getDay()
  return routines.filter((routine) => routine.days.includes(today))
}

// 状態：完了記録（"習慣ID__日付" の文字列の配列）
export const done = []

// 日付を "YYYY-MM-DD" で返す
// toISOString() は使わない。あれは内部でUTCに変換するので、
// 日本時間で夜遅く（UTCで日付が変わった後）実行すると前日の日付になってしまう。
// なので年・月・日をローカル時刻から自分で組み立てる。
function formatDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 今日の日付を "YYYY-MM-DD" で返す
export function todayKey() {
  return formatDateKey(new Date())
}

// 習慣IDと日付から完了記録のキーを作る
export function doneKey(routineId, dateStr) {
  return `${routineId}__${dateStr}`
}

// 今日、その習慣が完了しているか
export function isDone(routineId) {
  return done.includes(doneKey(routineId, todayKey()))
}

// 今日の完了状態を反転させる
export function toggleDone(routineId) {
  const key = doneKey(routineId, todayKey())
  const index = done.indexOf(key)
  if (index === -1) {
    done.push(key)
  } else {
    done.splice(index, 1)
  }
  saveState()
}

// 今週（月曜始まり）の7日分について、日ごとの予定数・完了数を集計する。
// getDay() は 日=0,月=1,...土=6 なので、月曜からの経過日数は (getDay()+6)%7 で求める
export function weekStats() {
  const now = new Date()
  const mondayOffset = (now.getDay() + 6) % 7
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset)

  const days = []
  let totalCount = 0
  let totalDone = 0

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
    const dateKey = formatDateKey(date)
    const scheduled = routines.filter((routine) => routine.days.includes(date.getDay()))
    const doneCount = scheduled.filter((routine) => done.includes(doneKey(routine.id, dateKey))).length

    days.push({ total: scheduled.length, done: doneCount, isFuture: date > now })
    totalCount += scheduled.length
    totalDone += doneCount
  }

  // 予定が0件なら達成率は計算できないので null にする（0%と区別するため）
  const rate = totalCount === 0 ? null : Math.round((totalDone / totalCount) * 100)

  return { days, totalCount, totalDone, rate }
}

const ROUTINES_KEY = 'habit.routines.v1'
const DONE_KEY = 'habit.done.v1'

// JSON文字列を安全にパースする。壊れていたり無かったりしたら fallback を返す
// （手動でlocalStorageを書き換えられたり、キーがまだ無い初回起動だったりで
//  JSON.parseが例外を投げることがあるので、それでアプリ全体が止まらないようにする）
function parseJson(text, fallback) {
  if (!text) return fallback
  try {
    return JSON.parse(text)
  } catch {
    return fallback
  }
}

// 状態をlocalStorageに保存する
export function saveState() {
  localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines))
  localStorage.setItem(DONE_KEY, JSON.stringify(done))
}

// localStorageから状態を読み込む
// routines・done は const なので中身を差し替える（再代入ではなく length=0 + push）
export function loadState() {
  const loadedRoutines = parseJson(localStorage.getItem(ROUTINES_KEY), [])
  const loadedDone = parseJson(localStorage.getItem(DONE_KEY), [])

  routines.length = 0
  routines.push(...loadedRoutines)

  done.length = 0
  done.push(...loadedDone)
}
