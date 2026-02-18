const $=id=>document.getElementById(id);

const todayScreen=$('todayScreen'),
      addBtn=$('addBtn'),
      modal=$('modal'),
      saveBtn=$('saveBtn'),
      cancelBtn=$('cancelBtn'),
      student=$('student'),
      subject=$('subject'),
      dateInput=$('date'),
      timeInput=$('startTime');

let lessons=JSON.parse(localStorage.getItem('lessons')||'[]');
const students=[{id:1,name:'Иван'},{id:2,name:'Мария'}];

students.forEach(s=>{
  const o=document.createElement('option');
  o.value=s.id;
  o.textContent=s.name;
  student.appendChild(o);
});

let currentDate=new Date();

/* ===== РЕНДЕР ДНЯ ===== */
function renderToday(dir=0){
  todayScreen.innerHTML='';
  todayScreen.classList.add('fadeSlide');

  const header=document.createElement('div');
  header.className='dayHeader';

  const left=document.createElement('button');
  left.className='arrow';
  left.textContent='←';
  left.onclick=()=>{currentDate.setDate(currentDate.getDate()-1);renderToday(-1);};

  const right=document.createElement('button');
  right.className='arrow';
  right.textContent='→';
  right.onclick=()=>{currentDate.setDate(currentDate.getDate()+1);renderToday(1);};

  const center=document.createElement('div');
  center.className='dayCenter';
  center.innerHTML=`<b>${currentDate.toLocaleDateString('ru-RU',{weekday:'long'})}</b><br>
                    <small>${currentDate.toISOString().slice(0,10)}</small>`;

  header.append(left,center,right);
  todayScreen.appendChild(header);

  const day=currentDate.toISOString().slice(0,10);
  const list=lessons.filter(l=>l.date===day);

  if(!list.length){
    todayScreen.innerHTML+='<p>Нет занятий</p>';
    return;
  }

  list.forEach((l,i)=>{
    const d=document.createElement('div');
    d.className='lesson';
    d.style.animationDelay=`${i*40}ms`;
    d.innerHTML=`
      <div>${l.time} — ${l.subject}<br><small>${l.student}</small></div>
      <div class="icons">
        <span class="del">🗑️</span>
      </div>`;
    d.querySelector('.del').onclick=()=>{
      d.classList.add('removing');
      setTimeout(()=>{
        lessons=lessons.filter(x=>x!==l);
        save();
      },180);
    };
    todayScreen.appendChild(d);
  });
}

/* ===== СВАЙПЫ ===== */
let startX=null;
todayScreen.addEventListener('touchstart',e=>startX=e.touches[0].clientX);
todayScreen.addEventListener('touchend',e=>{
  if(startX===null)return;
  const dx=e.changedTouches[0].clientX-startX;
  if(dx>60)currentDate.setDate(currentDate.getDate()-1);
  if(dx<-60)currentDate.setDate(currentDate.getDate()+1);
  renderToday();
  startX=null;
});

/* ===== ДОБАВЛЕНИЕ ===== */
addBtn.onclick=()=>modal.classList.add('active');
cancelBtn.onclick=()=>modal.classList.remove('active');

function check(){
  saveBtn.disabled=!(student.value&&dateInput.value&&timeInput.value);
}
student.onchange=check;
dateInput.oninput=check;
timeInput.oninput=check;

saveBtn.onclick=()=>{
  const s=students.find(x=>x.id==student.value);
  lessons.push({
    student:s.name,
    subject:subject.value,
    date:dateInput.value,
    time:timeInput.value
  });
  modal.classList.remove('active');
  save();
};

function save(){
  localStorage.setItem('lessons',JSON.stringify(lessons));
  renderToday();
}

renderToday();
