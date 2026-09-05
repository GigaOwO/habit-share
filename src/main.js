import './style.css'
import { addRoutine, toggleDone, loadState, validateRoutine } from './state.js'
import { renderToday, renderRoutineList, renderTodayDate, renderFriends, renderWeek } from './render.js'

loadState()
renderTodayDate()

const form = document.querySelector('#add-form')
const titleInput = document.querySelector('#title-input')
const todayList = document.querySelector('#today-list')
const errorMessage = document.querySelector('#error-message')

// エラーメッセージを1行ずつ並べて表示する（無ければ何も出さない）
function showErrors(errors) {
  errorMessage.textContent = ''
  for (const error of errors) {
    const line = document.createElement('div')
    line.textContent = error
    errorMessage.appendChild(line)
  }
}

todayList.addEventListener('change', (event) => {
  const checkbox = event.target
  if (checkbox.type !== 'checkbox') return

  toggleDone(checkbox.dataset.id)
  renderToday()
  renderFriends()
  renderWeek()
})

form.addEventListener('submit', (event) => {
  event.preventDefault()

  const checked = document.querySelectorAll('input[name="day"]:checked')
  const days = Array.from(checked).map((checkbox) => Number(checkbox.value))
  const title = titleInput.value.trim()

  const errors = validateRoutine(title, days)
  if (errors.length > 0) {
    showErrors(errors)
    return
  }

  showErrors([])
  addRoutine(title, days)
  titleInput.value = ''
  checked.forEach((checkbox) => (checkbox.checked = false))

  renderToday()
  renderRoutineList()
  renderFriends()
  renderWeek()
})

renderToday()
renderRoutineList()
renderFriends()
renderWeek()
