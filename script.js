const modal = document.getElementById('modal');
const addBtn = document.getElementById('addBtn');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');

const student = document.getElementById('student');
const subject = document.getElementById('subject');
const date = document.getElementById('date');
const time = document.getElementById('startTime');
const price = document.getElementById('price');

const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');
const closeMenu = document.getElementById('closeMenu');
const menuThemeToggle = document.getElementById('menuThemeToggle');

/* ===== Гарантия ===== */
modal.classList.remove('active');
sideMenu.classList.remove('open');
overlay.classList.remove('show');

/* ===== Меню ===== */
menuBtn.onclick = () => {
  sideMenu.classList.add('open');
  overlay.classList.add('show');
};

closeMenu.onclick = closeSideMenu;
overlay.onclick = closeSideMenu;

function closeSideMenu() {
  sideMenu.classList.remove('open');
  overlay.classList.remove('show');
}

/* ===== Тема ===== */
menuThemeToggle.onclick = () => {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
};

/* ===== Модалка ===== */
addBtn.onclick = () => modal.classList.add('active');
cancelBtn.onclick = () => modal.classList.remove('active');

function check() {
  saveBtn.disabled = !(student.value && date.value && time.value);
}

student.onchange = check;
date.oninput = check;
time.oninput = check;

/* ===== Ученики ===== */
const students = [
  { id: 1, name: 'Иван', price: 700 },
  { id: 2, name: 'Мария', price: 1000 }
];

students.forEach(s => {
  const o = document.createElement('option');
  o.value = s.id;
  o.textContent = s.name;
  student.appendChild(o);
});
