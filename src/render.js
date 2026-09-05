import { routines, todayRoutines, isDone, weekStats } from './state.js'
import { friends } from './friends.js'

const dayLabels = ['日', '月', '火', '水', '木', '金', '土']

// ヘッダーの日付表示（例: 9/5（金））を組み立てる
export function renderTodayDate() {
  const el = document.querySelector('#today-date')
  const now = new Date()
  const month = now.getMonth() + 1
  const date = now.getDate()
  const day = dayLabels[now.getDay()]
  el.textContent = `${month}/${date}（${day}）`
}

// 今日のタスクを描画する
export function renderToday() {
  const list = document.querySelector('#today-list')
  list.textContent = ''

  const today = todayRoutines()

  if (today.length === 0) {
    const li = document.createElement('li')
    li.textContent = '今日は予定なし'
    list.appendChild(li)
    return
  }

  for (const routine of today) {
    const li = document.createElement('li')

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.dataset.id = routine.id
    checkbox.checked = isDone(routine.id)

    const label = document.createElement('label')
    label.textContent = routine.title
    label.prepend(checkbox)

    li.appendChild(label)
    list.appendChild(li)
  }
}

// 今週の達成を描画する（丸7個と "8 / 12（67%）"）
export function renderWeek() {
  const summary = document.querySelector('#week-summary')
  const dotsEl = document.querySelector('#week-dots')
  dotsEl.textContent = ''

  const { days, totalCount, totalDone, rate } = weekStats()
  summary.textContent = rate === null ? '今週はまだ予定なし' : `${totalDone} / ${totalCount}（${rate}%）`

  for (const day of days) {
    const dot = document.createElement('span')
    dot.className = 'dot'

    if (!day.isFuture) {
      dot.classList.add(day.total > 0 && day.done === day.total ? 'dot--done' : 'dot--pending')
    }

    dotsEl.appendChild(dot)
  }
}

// みんなの今日を描画する（自分の分は state.js から計算し、friends.js のサンプルには混ぜない）
export function renderFriends() {
  const list = document.querySelector('#friends-list')
  list.textContent = ''

  const today = todayRoutines()
  const me = {
    name: '自分',
    todayCount: today.length,
    doneCount: today.filter((routine) => isDone(routine.id)).length,
    isMe: true,
  }
  const people = [me, ...friends]

  for (const person of people) {
    const li = document.createElement('li')
    li.className = person.isMe ? 'me' : 'friend'

    const name = document.createElement('span')
    name.textContent = person.name

    const score = document.createElement('span')
    const allDone = person.todayCount > 0 && person.doneCount === person.todayCount
    score.textContent = `${person.doneCount}/${person.todayCount}${allDone ? ' 🔥' : ''}`

    li.appendChild(name)
    li.appendChild(score)
    list.appendChild(li)
  }
}

// 登録済みの習慣一覧を描画する
export function renderRoutineList() {
  const list = document.querySelector('#routine-list')
  list.textContent = ''

  for (const routine of routines) {
    const li = document.createElement('li')
    const days = routine.days.map((day) => dayLabels[day]).join('')
    li.textContent = `${routine.title}（${days}）`
    list.appendChild(li)
  }
}
