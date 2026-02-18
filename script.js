const $ = id => document.getElementById(id);

const modal = $('modal'),
      addBtn = $('addBtn'),
      cancelBtn = $('cancelBtn'),
      saveBtn = $('saveBtn'),
      menuBtn = $('menuBtn'),
      sideMenu = $('sideMenu'),
      overlay = $('overlay'),
      closeMenu = $('closeMenu'),
      goToday = $('goToday'),
      goAll = $('goAll'),
      goAnalytics = $('goAnalytics'),
      goStudents = $('goStudents'),
      title = $('title'),
      todayScreen = $('todayScreen'),
      allScreen = $('allScreen'),
      analyticsScreen = $('analyticsScreen'),
      studentsScreen = $('studentsScreen'),
      analyticsDate = $('analyticsDate'),
      countDone = $('countDone'),
      countPaid = $('countPaid'),
      sumIncome = $('sumIncome'),
      sumDebt = $('sumDebt'),
      student = $('student'),
      subject = $('subject'),
      dateInput = $('date'),
      timeInput = $('startTime'),
      priceInput = $('price');

let lessons = JSON.parse(localStorage.getItem('lessons') || '[]');
const students = [{id:1,name:'Иван',price:700},{id:2,name:'Мария',price:1000}];

// Заполняем селект учеников
students.forEach(s => {
  const o = document.createElement('option');
  o.value = s.id;
  o.textContent = s.name;
  student.appendChild(o);
});

// ====== МЕНЮ ======
menuBtn.onclick = () => { sideMenu.classList.add('open'); overlay.classList.add('show'); };
overlay.onclick = closeSideMenu;
closeMenu.onclick = closeSideMenu;
function closeSideMenu() {
  sideMenu.classList.remove('open');
  overlay.classList.remove('show');
}

// ====== ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ ======
goToday.onclick = () => showScreen('today');
goAll.onclick = () => showScreen('all');
goAnalytics.onclick = () => showScreen('analytics');
goStudents.onclick = () => showScreen('students');

function showScreen(s) {
  todayScreen.classList.add('hidden');
  allScreen.classList.add('hidden');
  analyticsScreen.classList.add('hidden');
  studentsScreen.classList.add('hidden');

  if(s==='today'){todayScreen.classList.remove('hidden');renderToday();}
  if(s==='all'){allScreen.classList.remove('hidden');renderAll();}
  if(s==='analytics'){analyticsScreen.classList.remove('hidden');renderAnalytics();}
  if(s==='students'){studentsScreen.classList.remove('hidden');renderStudents();}

  closeSideMenu();
}

// ====== ТЕМА ======
const themeBtn = $('menuThemeToggle');
function updateThemeIcon(){
  themeBtn.textContent = document.body.classList.contains('dark') ? '🌗' : '☀️';
  themeBtn.classList.add('active');
  setTimeout(()=>themeBtn.classList.remove('active'),300);
}
themeBtn.onclick = () => {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
  updateThemeIcon();
}
updateThemeIcon();

// ====== МОДАЛЬНОЕ ОКНО ======
addBtn.onclick = () => modal.classList.add('active');
cancelBtn.onclick = () => modal.classList.remove('active');

student.onchange = check; dateInput.oninput = check; timeInput.oninput = check;
function check() {
  saveBtn.disabled = !(student.value && dateInput.value && timeInput.value);
}

saveBtn.onclick = () => {
  const s = students.find(x => x.id == student.value);
  lessons.push({
    student: s.name,
    subject: subject.value,
    date: dateInput.value,
    time: timeInput.value,
    price: priceInput.value || s.price,
    status: 'planned',
    paid: false
  });
  saveAll();
  modal.classList.remove('active');
}

// ====== СТАТУСЫ И ОПЛАТА ======
function statusIcon(s){return s==='done'?'✅':s==='cancelled'?'❌':'🕒';}
function nextStatus(s){return s==='planned'?'done':s==='done'?'cancelled':'planned';}

// ====== РЕНДЕР УРОКОВ ======
function renderLesson(container,l, showDate=false){
  const d = document.createElement('div');
  d.className = 'lesson';
  d.innerHTML = `<div>${l.time} — ${l.subject} (${l.student})<br>${l.price} ₽</div>
  <div>
    <span class="status">${statusIcon(l.status)}</span>
    <span class="paid">${l.paid?'💰':'⏳'}</span>
    <span class="move">🔁</span>
    <span class="delete">🗑️</span>
  </div>`;
  d.querySelector('.status').onclick = () => { l.status = nextStatus(l.status); saveAll(); }
  d.querySelector('.paid').onclick = () => { l.paid = !l.paid; saveAll(); }
  d.querySelector('.move').onclick = () => {
    const newDate = prompt("Новая дата YYYY-MM-DD", l.date);
    const newTime = prompt("Новое время HH:MM", l.time);
    if(newDate && newTime){ l.date=newDate; l.time=newTime; saveAll(); }
  }
  d.querySelector('.delete').onclick = () => { 
    if(confirm('Удалить это занятие?')) {
      lessons = lessons.filter(x => x !== l); saveAll(); 
    }
  }
  container.appendChild(d);
}

// ====== ЭКРАН СЕГОДНЯ ======
let currentDay = new Date();
const dayLabel = document.createElement('div');
dayLabel.style.fontSize = '18px';
dayLabel.style.marginBottom = '12px';
todayScreen.prepend(dayLabel);

function renderToday() {
  todayScreen.innerHTML = '';
  todayScreen.appendChild(dayLabel);

  const options = { weekday: 'long', day: '2-digit', month: '2-digit', year:'numeric' };
  const dayStr = currentDay.toLocaleDateString('ru-RU', options);
  const dayName = currentDay.toLocaleDateString('ru-RU', { weekday:'long' });
  const dateNum = currentDay.toISOString().slice(0,10);
  dayLabel.innerHTML = `${dayName} <span style="opacity:0.6;font-size:14px;">${dateNum}</span>`;

  const list = lessons.filter(l => l.date === dateNum);
  if(!list.length){ todayScreen.innerHTML += '<p>Нет занятий</p>'; return; }
  list.forEach(l => renderLesson(todayScreen, l));
}

// Листаем дни вправо/влево с клавишами (для iPhone можно использовать свайпы позже)
document.addEventListener('keydown', e => {
  if(e.key === 'ArrowLeft'){ currentDay.setDate(currentDay.getDate()-1); renderToday(); }
  if(e.key === 'ArrowRight'){ currentDay.setDate(currentDay.getDate()+1); renderToday(); }
});

// ====== ЭКРАН ВСЕХ ЗАНЯТИЙ ======
function renderAll(){ allScreen.innerHTML=''; lessons.forEach(l => renderLesson(allScreen,l,true)); }

// ====== АНАЛИТИКА ======
analyticsDate.value = new Date().toISOString().slice(0,10);
analyticsDate?.addEventListener('change', renderAnalytics);
function renderAnalytics(){
  const d = analyticsDate.value;
  const list = lessons.filter(l=>l.date===d && l.status==='done');
  const paid = list.filter(l=>l.paid);
  const income = paid.reduce((s,l)=>s+Number(l.price),0);
  const debt = list.reduce((s,l)=>s+Number(l.price),0)-income;
  if(countDone) countDone.textContent = list.length;
  if(countPaid) countPaid.textContent = paid.length;
  if(sumIncome) sumIncome.textContent = income+' ₽';
  if(sumDebt) sumDebt.textContent = debt+' ₽';
}

// ====== ЭКРАН УЧЕНИКОВ ======
function renderStudents(){
  studentsScreen.innerHTML='';
  students.forEach(s=>{
    const d = document.createElement('div'); d.className='students-card';
    const studentLessons = lessons.filter(l=>l.student===s.name);
    const paidCount = studentLessons.filter(l=>l.paid).length;
    const total = studentLessons.reduce((sum,l)=>sum+Number(l.price),0);
    const debt = total - studentLessons.filter(l=>l.paid).reduce((sum,l)=>sum+Number(l.price),0);
    d.innerHTML = `<strong>${s.name}</strong> — Цена: ${s.price} ₽<br>
    Занятий: ${studentLessons.length}, Оплачено: ${paidCount}, Долг: ${debt} ₽<br>
    <button class="changePrice">Сменить цену</button>`;
    d.querySelector('.changePrice').onclick=()=>{
      const np=parseInt(prompt("Новая цена",s.price));
      if(np){s.price=np;saveAll();}
    };
    studentsScreen.appendChild(d);
  });
}

// ====== СОХРАНЕНИЕ ======
function saveAll(){
  localStorage.setItem('lessons',JSON.stringify(lessons));
  renderToday(); renderAll(); renderAnalytics(); renderStudents();
}

// ====== ИНИЦИАЛИЗАЦИЯ ======
renderToday();
showScreen('today');
