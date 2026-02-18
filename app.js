const scheduleEl = document.getElementById("schedule");
const todayDateEl = document.getElementById("todayDate");
const addBtn = document.getElementById("addBtn");
const modal = document.getElementById("modal");
const saveBtn = document.getElementById("saveBtn");

const titleInput = document.getElementById("titleInput");
const dayInput = document.getElementById("dayInput");
const startInput = document.getElementById("startInput");
const endInput = document.getElementById("endInput");

const weekdaysRu = [
  "воскресенье",
  "понедельник",
  "вторник",
  "среда",
  "четверг",
  "пятница",
  "суббота"
];

const weekdaysKey = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];

let baseSchedule = JSON.parse(localStorage.getItem("baseSchedule")) || {};

function render() {
  const now = new Date();
  todayDateEl.textContent =
    weekdaysRu[now.getDay()] + ", " + now.toLocaleDateString("ru-RU");

  const dayKey = weekdaysKey[now.getDay()];
  const lessons = baseSchedule[dayKey] || [];

  scheduleEl.innerHTML = "";

  if (lessons.length === 0) {
    scheduleEl.innerHTML = "<p>Сегодня занятий нет 🎉</p>";
    return;
  }

  lessons.forEach(lesson => {
    const div = document.createElement("div");
    div.className = "lesson";
    div.innerHTML = `
      <div class="color" style="background:#5B8DEF"></div>
      <div class="info">
        <div class="time">${lesson.start} – ${lesson.end}</div>
        <div class="title">${lesson.title}</div>
      </div>
    `;
    scheduleEl.appendChild(div);
  });
}

addBtn.addEventListener("click", () => {
  modal.style.display = "flex";
  modal.classList.remove("hidden");
});

saveBtn.addEventListener("click", () => {
  if (!titleInput.value || !startInput.value || !endInput.value) {
    alert("Заполни все поля");
    return;
  }

  const lesson = {
    title: titleInput.value,
    start: startInput.value,
    end: endInput.value
  };

  if (!baseSchedule[dayInput.value]) {
    baseSchedule[dayInput.value] = [];
  }

  baseSchedule[dayInput.value].push(lesson);
  localStorage.setItem("baseSchedule", JSON.stringify(baseSchedule));

  modal.classList.add("hidden");
  titleInput.value = "";
  startInput.value = "";
  endInput.value = "";

  render();
});

render();
