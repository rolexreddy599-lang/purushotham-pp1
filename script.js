const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const initialRooms = Array.from({length:24},(_,i)=>({number:101+i,type:i<8?'Standard':i<16?'Deluxe':'Suite',price:i<8?1800:i<16?2800:4200,status:i<6?'Occupied':i<8?'Maintenance':'Available'}));
const sampleBookings = [
 {id:1,guest:'Ananya Sharma',email:'ananya@example.com',room:'101',checkin:'2026-11-06',checkout:'2026-11-08',people:2,status:'Checked-in',notes:''},
 {id:2,guest:'Rahul Verma',email:'rahul@example.com',room:'102',checkin:'2026-11-06',checkout:'2026-11-07',people:1,status:'Checked-in',notes:''},
 {id:3,guest:'Meera Reddy',email:'meera@example.com',room:'103',checkin:'2026-11-06',checkout:'2026-11-09',people:2,status:'Checked-in',notes:''},
 {id:4,guest:'Arjun Kumar',email:'arjun@example.com',room:'104',checkin:'2026-11-06',checkout:'2026-11-08',people:3,status:'Checked-in',notes:''},
 {id:5,guest:'Priya Nair',email:'priya@example.com',room:'105',checkin:'2026-11-06',checkout:'2026-11-07',people:2,status:'Checked-in',notes:''},
 {id:6,guest:'Kiran Rao',email:'kiran@example.com',room:'106',checkin:'2026-11-06',checkout:'2026-11-10',people:2,status:'Checked-in',notes:''},
 {id:7,guest:'Sana Ali',email:'sana@example.com',room:'107',checkin:'2026-11-08',checkout:'2026-11-10',people:2,status:'Confirmed',notes:''},
 {id:8,guest:'Dev Patel',email:'dev@example.com',room:'108',checkin:'2026-11-09',checkout:'2026-11-11',people:1,status:'Confirmed',notes:''}
];
let rooms = JSON.parse(localStorage.getItem('staysuite_rooms') || 'null') || initialRooms;
let bookings = JSON.parse(localStorage.getItem('staysuite_bookings') || 'null') || sampleBookings;
const save = () => {localStorage.setItem('staysuite_rooms',JSON.stringify(rooms));localStorage.setItem('staysuite_bookings',JSON.stringify(bookings));};
const money = n => '₹'+Number(n).toLocaleString('en-IN');
const dateFmt = s => s ? new Date(s+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600);}
function statusClass(s){return s.toLowerCase().replaceAll(' ','-');}
function stats(){
 const available=rooms.filter(r=>r.status==='Available').length, occupied=rooms.filter(r=>r.status==='Occupied').length, maintenance=rooms.filter(r=>r.status==='Maintenance').length;
 const pct=rooms.length?Math.round(occupied/rooms.length*100):0;
 $('#totalRooms').textContent=rooms.length;$('#availableRooms').textContent=available;$('#occupiedRooms').textContent=occupied;$('#bookingCount').textContent=bookings.length;
 $('#legendAvailable').textContent=available;$('#legendOccupied').textContent=occupied;$('#legendMaintenance').textContent=maintenance;$('#occupancyPercent').textContent=pct+'%';
 $('#donut').style.background=`conic-gradient(var(--orange) 0 ${pct}%, #e9ebf2 ${pct}% 100%)`;
 $('#reportUtil').textContent=pct+'%';$('#reportBookings').textContent=bookings.length;
 const revenue=bookings.filter(b=>b.status!=='Cancelled').reduce((sum,b)=>{const r=rooms.find(x=>String(x.number)===String(b.room));const nights=Math.max(1,(new Date(b.checkout)-new Date(b.checkin))/86400000||1);return sum+(r?r.price:0)*nights;},0);
 $('#reportRevenue').textContent=money(revenue);
 $('#statusBars').innerHTML=[['Available',available,'var(--green)'],['Occupied',occupied,'var(--orange)'],['Maintenance',maintenance,'#c6cad6']].map(([n,v,c])=>`<div class="bar-row"><span>${n}</span><div class="bar-track"><div class="bar-fill" style="width:${rooms.length?v/rooms.length*100:0}%;background:${c}"></div></div><b>${v}</b></div>`).join('');
}
function bookingRows(list,withAction=false){if(!list.length)return `<tr><td colspan="${withAction?7:5}" class="empty">No reservations found.</td></tr>`;return list.map(b=>`<tr><td>${escapeHtml(b.guest)}</td>${withAction?`<td>${escapeHtml(b.email)}</td>`:''}<td>${b.room}</td><td>${dateFmt(b.checkin)}</td><td>${dateFmt(b.checkout)}</td><td><span class="status ${statusClass(b.status)}">${b.status}</span></td>${withAction?`<td><button class="action-link" data-cancel="${b.id}">${b.status==='Cancelled'?'—':'Cancel'}</button></td>`:''}</tr>`).join('');}
function renderBookings(){$('#recentBookings').innerHTML=bookingRows(bookings.slice().sort((a,b)=>b.id-a.id).slice(0,5));$('#allBookings').innerHTML=bookingRows(bookings.slice().sort((a,b)=>b.id-a.id),true);}
function renderRooms(){const q=($('#roomSearch')?.value||'').toLowerCase(),f=$('#roomFilter')?.value||'all';const list=rooms.filter(r=>(String(r.number).includes(q)||r.type.toLowerCase().includes(q))&&(f==='all'||r.status===f));$('#roomGrid').innerHTML=list.length?list.map(r=>`<article class="room-card"><div class="room-card-top"><span class="room-number">#${r.number}</span><span class="status ${statusClass(r.status)}">${r.status}</span></div><div class="room-type">${r.type} room</div><b>${money(r.price)} <small style="color:var(--muted);font-size:9px;font-weight:400">/ night</small></b><div class="room-card-bottom"><small>Update status</small><select data-room="${r.number}"><option ${r.status==='Available'?'selected':''}>Available</option><option ${r.status==='Occupied'?'selected':''}>Occupied</option><option ${r.status==='Maintenance'?'selected':''}>Maintenance</option></select></div></article>`).join(''):'<div class="empty">No rooms match your search.</div>';}
function renderGuests(){const unique=[...new Map(bookings.filter(b=>b.status!=='Cancelled').map(b=>[b.email,b])).values()];$('#guestGrid').innerHTML=unique.length?unique.map(g=>`<article class="guest-card"><div class="guest-avatar">${escapeHtml(g.guest.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase())}</div><b>${escapeHtml(g.guest)}</b><small>${escapeHtml(g.email)}</small><div class="guest-meta">Last booking · Room ${g.room}<br>${dateFmt(g.checkin)}</div></article>`).join(''):'<div class="empty">No guest records yet.</div>';}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderAll(){stats();renderBookings();renderRooms();renderGuests();}
const viewNames={overview:'Overview',rooms:'Room management',bookings:'Reservations',guests:'Guests',reports:'Reports',founder:'Project founder'};
function showView(name){$$('.view').forEach(v=>v.classList.remove('active'));$('#'+name+'View').classList.add('active');$$('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.view===name));$('#pageCrumb').textContent=viewNames[name];$('#pageTitle').innerHTML=name==='overview'?'Good morning, Admin <span>✦</span>':viewNames[name];$('#pageSubtitle').textContent=({overview:'Here’s what’s happening at your hotel today.',rooms:'Track room types, rates and current status.',bookings:'Manage guest reservations in one place.',guests:'Guest contact details from your reservations.',reports:'A quick overview of your hotel performance.',founder:'The person behind this hotel management project.'})[name];$('#sidebar').classList.remove('open');}
function openModal(){const select=$('#bookingRoom');const free=rooms.filter(r=>r.status==='Available');select.innerHTML=free.map(r=>`<option value="${r.number}">Room ${r.number} · ${r.type} · ${money(r.price)}/night</option>`).join('');if(!free.length){toast('No available rooms. Update a room status first.');return;}const today=new Date().toISOString().slice(0,10);$('#checkin').min=today;$('#checkout').min=today;$('#bookingModal').classList.add('open');$('#bookingModal').setAttribute('aria-hidden','false');}
function closeModal(){$('#bookingModal').classList.remove('open');$('#bookingModal').setAttribute('aria-hidden','true');$('#bookingForm').reset();$('#formError').textContent='';}
function setup(){
 const now=new Date();$('#todayLabel').textContent=now.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'});$('#year').textContent=now.getFullYear();
 $$('.nav-link').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
 $$('[data-goto]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.goto)));
 $$('[data-action]').forEach(b=>b.addEventListener('click',()=>b.dataset.action==='booking'?openModal():showView(b.dataset.action)));
 $('#newBookingBtn').addEventListener('click',openModal);$('#bookingPageAdd').addEventListener('click',openModal);
 $$('[data-close]').forEach(b=>b.addEventListener('click',closeModal));$('#bookingModal').addEventListener('click',e=>{if(e.target===$('#bookingModal'))closeModal();});
 $('#bookingForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.target),data=Object.fromEntries(fd.entries());if(data.checkout<=data.checkin){$('#formError').textContent='Check-out must be after check-in.';return;}const room=rooms.find(r=>String(r.number)===data.room);if(!room||room.status!=='Available'){ $('#formError').textContent='This room is no longer available. Please choose another.';return;}const conflict=bookings.some(b=>String(b.room)===data.room&&b.status!=='Cancelled'&&data.checkin<b.checkout&&data.checkout>b.checkin);if(conflict){$('#formError').textContent='This room already has a reservation for those dates.';return;}bookings.push({id:Date.now(),...data,status:'Confirmed'});save();renderAll();closeModal();toast('Reservation saved successfully.');});
 $('#roomGrid').addEventListener('change',e=>{if(e.target.matches('[data-room]')){const r=rooms.find(x=>String(x.number)===e.target.dataset.room);r.status=e.target.value;save();renderAll();toast(`Room ${r.number} updated.`);}});
 $('#roomSearch').addEventListener('input',renderRooms);$('#roomFilter').addEventListener('change',renderRooms);
 $('#bookingSearch').addEventListener('input',()=>{const q=$('#bookingSearch').value.toLowerCase();const list=bookings.filter(b=>b.guest.toLowerCase().includes(q)||String(b.room).includes(q)||b.email.toLowerCase().includes(q));$('#allBookings').innerHTML=bookingRows(list,true);});
 $('#allBookings').addEventListener('click',e=>{const id=e.target.dataset.cancel;if(!id)return;const b=bookings.find(x=>x.id==id);if(b&&confirm(`Cancel reservation for ${b.guest}?`)){b.status='Cancelled';save();renderAll();toast('Reservation cancelled.');}});
 $('#themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('staysuite_dark',document.body.classList.contains('dark'));});
 if(localStorage.getItem('staysuite_dark')==='true')document.body.classList.add('dark');
 $('#menuBtn').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
 $('#helpBtn').addEventListener('click',()=>alert('Quick guide\\n\\n1. Use Room management to update room status.\\n2. Add reservations from the New reservation button.\\n3. Search reservations and cancel when needed.\\n4. Reports update automatically from your saved data.\\n\\nDemo data is stored in this browser using localStorage.'));
 $('#profileBtn').addEventListener('click',()=>showView('founder'));
 $('#checkout').addEventListener('change',()=>{$('#checkin').max=$('#checkout').value;});
 $('#checkin').addEventListener('change',()=>{$('#checkout').min=$('#checkin').value;});
 renderAll();
}
document.addEventListener('DOMContentLoaded',setup);
