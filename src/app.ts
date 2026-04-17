import { Estudiante } from "./models/estudiante.js";
import { Curso } from "./models/curso.js";
import { Inscripcion } from "./models/inscripcion.js";
import { EstudianteService } from "./services/estudiante.service.js";
import { CursoService } from "./services/curso.service.js";
import { InscripcionService } from "./services/inscripcion.service.js";
import { required, isEmail, isPositiveInteger } from "./utils/validators.js";

const estudianteSvc = new EstudianteService();
const cursoSvc = new CursoService();
const inscSvc = new InscripcionService();

let editingEstId: number | null = null;
let editingCurId: number | null = null;
let modalAction: (()=>void) | null = null;
let estSort: { key: 'nombre'|'correo'|'edad'|'carrera'|'estado', dir: 1|-1 } = { key: 'nombre', dir: 1 };
let curSort: { key: 'nombre'|'sigla'|'docente'|'cupoMaximo'|'estado', dir: 1|-1 } = { key: 'nombre', dir: 1 };
let insSort: { key: 'estudiante'|'curso'|'fecha'|'estado', dir: 1|-1 } = { key: 'fecha', dir: -1 };

function q<T extends HTMLElement>(sel: string, parent: Document | HTMLElement = document): T | null {
  return parent.querySelector(sel) as T | null;
}

function showMessage(msg: string, isError = false){
  const box = q<HTMLDivElement>('#msg');
  if(box){ box.textContent = msg; box.style.color = isError ? 'crimson' : 'green'; setTimeout(()=>{ box.textContent = ''; }, 3000); }
  else alert(msg);
}

function closeModal(){
  const modal = q<HTMLDivElement>('#modal');
  const extra = q<HTMLDivElement>('#modal-extra');
  const text = q<HTMLParagraphElement>('#modal-text');
  if(extra) extra.remove();
  if(text) text.style.display = '';
  if(modal){
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
  modalAction = null;
}

function showConfirmModal(message: string, onConfirm: ()=>void, confirmLabel = 'Confirmar'){
  const modal = q<HTMLDivElement>('#modal');
  const text = q<HTMLParagraphElement>('#modal-text');
  const confirmBtn = q<HTMLButtonElement>('#modal-confirm');
  if(!modal || !text || !confirmBtn){
    if(confirm(message)) onConfirm();
    return;
  }
  const extra = q<HTMLDivElement>('#modal-extra');
  if(extra) extra.remove();
  text.style.display = '';
  text.textContent = message;
  confirmBtn.textContent = confirmLabel;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  modalAction = onConfirm;
}

function showEditEstudianteModal(id: number){
  const est = estudianteSvc.findById(id);
  if(!est) return;
  const modal = q<HTMLDivElement>('#modal');
  const text = q<HTMLParagraphElement>('#modal-text');
  const confirmBtn = q<HTMLButtonElement>('#modal-confirm');
  const content = q<HTMLDivElement>('.modal-content');
  if(!modal || !text || !confirmBtn || !content) return;
  text.style.display = '';
  text.textContent = 'Editar estudiante';
  const old = q<HTMLDivElement>('#modal-extra');
  if(old) old.remove();
  const extra = document.createElement('div');
  extra.id = 'modal-extra';
  extra.className = 'modal-form';
  extra.innerHTML = `
    <input id="m-est-nombre" value="${est.nombre}" placeholder="Nombre completo" />
    <input id="m-est-correo" value="${est.correo}" placeholder="Correo" />
    <input id="m-est-edad" value="${est.edad}" type="number" placeholder="Edad" />
    <input id="m-est-carrera" value="${est.carrera}" placeholder="Carrera" />
  `;
  content.insertBefore(extra, q<HTMLDivElement>('.modal-actions')!);
  confirmBtn.textContent = 'Guardar';
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  modalAction = ()=>{
    const nombre = (q<HTMLInputElement>('#m-est-nombre')?.value || '').trim();
    const correo = (q<HTMLInputElement>('#m-est-correo')?.value || '').trim();
    const edad = Number(q<HTMLInputElement>('#m-est-edad')?.value || 0);
    const carrera = (q<HTMLInputElement>('#m-est-carrera')?.value || '').trim();
    if (!required(nombre) || !required(correo) || !required(String(edad)) || !required(carrera)) throw new Error('Todos los campos son requeridos');
    if (!isEmail(correo)) throw new Error('Email inválido');
    if (!isPositiveInteger(edad)) throw new Error('Edad inválida');
    estudianteSvc.update(id, { nombre, correo, edad, carrera });
    refreshAll();
    showMessage('Estudiante actualizado');
  };
}

function showEditCursoModal(id: number){
  const cur = cursoSvc.findById(id);
  if(!cur) return;
  const modal = q<HTMLDivElement>('#modal');
  const text = q<HTMLParagraphElement>('#modal-text');
  const confirmBtn = q<HTMLButtonElement>('#modal-confirm');
  const content = q<HTMLDivElement>('.modal-content');
  if(!modal || !text || !confirmBtn || !content) return;
  text.style.display = '';
  text.textContent = 'Editar curso';
  const old = q<HTMLDivElement>('#modal-extra');
  if(old) old.remove();
  const extra = document.createElement('div');
  extra.id = 'modal-extra';
  extra.className = 'modal-form';
  extra.innerHTML = `
    <input id="m-cur-nombre" value="${cur.nombre}" placeholder="Nombre del curso" />
    <input id="m-cur-sigla" value="${cur.sigla}" placeholder="Sigla" />
    <input id="m-cur-docente" value="${cur.docente}" placeholder="Docente" />
    <input id="m-cur-cupo" value="${cur.cupoMaximo}" type="number" placeholder="Cupo máximo" />
  `;
  content.insertBefore(extra, q<HTMLDivElement>('.modal-actions')!);
  confirmBtn.textContent = 'Guardar';
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  modalAction = ()=>{
    const nombre = (q<HTMLInputElement>('#m-cur-nombre')?.value || '').trim();
    const sigla = (q<HTMLInputElement>('#m-cur-sigla')?.value || '').trim();
    const docente = (q<HTMLInputElement>('#m-cur-docente')?.value || '').trim();
    const cupoMaximo = Number(q<HTMLInputElement>('#m-cur-cupo')?.value || 0);
    if (!required(nombre) || !required(sigla) || !required(docente) || !required(String(cupoMaximo))) throw new Error('Todos los campos son requeridos');
    if (!isPositiveInteger(cupoMaximo)) throw new Error('Cupo máximo inválido');
    cursoSvc.update(id, { nombre, sigla, docente, cupoMaximo });
    refreshAll();
    showMessage('Curso actualizado');
  };
}

function toggleDarkMode(){
  document.body.classList.toggle('dark');
  const enabled = document.body.classList.contains('dark');
  localStorage.setItem('ui:dark', enabled ? '1' : '0');
}

function applySavedTheme(){
  const enabled = localStorage.getItem('ui:dark') === '1';
  document.body.classList.toggle('dark', enabled);
}

function exportData(){
  const data = {
    estudiantes: estudianteSvc.getAll(),
    cursos: cursoSvc.getAll(),
    inscripciones: inscSvc.getAll()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `respaldo-sistema-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function importData(file: File){
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const raw = String(reader.result || '{}');
      const json = JSON.parse(raw);
      if (!Array.isArray(json.estudiantes) || !Array.isArray(json.cursos) || !Array.isArray(json.inscripciones)) {
        throw new Error('El JSON no tiene el formato esperado');
      }
      estudianteSvc.setAll(json.estudiantes);
      cursoSvc.setAll(json.cursos);
      inscSvc.setAll(json.inscripciones);
      refreshAll();
      showMessage('Datos importados correctamente');
    }catch(err:any){
      showMessage(err.message || 'Error al importar JSON', true);
    }
  };
  reader.readAsText(file);
}

function compareValues(a: string|number, b: string|number, dir: 1|-1){
  if (typeof a === 'number' && typeof b === 'number') return (a - b) * dir;
  return String(a).localeCompare(String(b), 'es', { sensitivity: 'base' }) * dir;
}

async function buildUI(){
  const app = document.getElementById('app') || document.body;
  // If the page provides a static layout inside #app (for separate screens), use it instead
  const isStaticLayout = (app.getAttribute && app.getAttribute('data-static') === 'true') || !!app.querySelector('[data-tab]');
  if (isStaticLayout) {
    bindEvents();
    await seedDataIfNeeded();
    const requested = (app.getAttribute && app.getAttribute('data-tab')) || 'dashboard';
    showTab(requested);
    refreshAll();
    return;
  }
  const container = document.createElement('div'); container.className = 'container-card';
  container.innerHTML = `
    <h1>Sistema Académico</h1>
    <div id="msg" role="status" class="msg"></div>
  `;

  // Dashboard section
  const dash = document.createElement('div'); dash.setAttribute('data-tab','dashboard');
  dash.className = 'container-card';
  dash.innerHTML = `
    <div class="cards" id="dashboard-cards"></div>
    <h3>Resumen</h3>
    <div id="dashboard-summary"></div>
  `;

  // Students section
  const estSect = document.createElement('div'); estSect.setAttribute('data-tab','est');
  estSect.className = 'container-card';
  estSect.innerHTML = `
    <h2>Estudiante</h2>
    <form id="est-form">
      <input name="nombre" placeholder="Nombre completo" required />
      <input name="correo" placeholder="Correo" required />
      <input name="edad" placeholder="Edad" type="number" required />
      <input name="carrera" placeholder="Carrera" required />
      <button type="submit">Guardar estudiante</button>
      <button type="button" id="est-cancel" style="display:none">Cancelar</button>
    </form>
    <div id="est-list"></div>
  `;

  // Courses section
  const curSect = document.createElement('div'); curSect.setAttribute('data-tab','cur');
  curSect.className = 'container-card';
  curSect.innerHTML = `
    <h2>Curso</h2>
    <form id="cur-form">
      <input name="nombre" placeholder="Nombre del curso" required />
      <input name="sigla" placeholder="Sigla" required />
      <input name="docente" placeholder="Docente" required />
      <input name="cupoMaximo" placeholder="Cupo máximo" type="number" required />
      <button type="submit">Guardar curso</button>
      <button type="button" id="cur-cancel" style="display:none">Cancelar</button>
    </form>
    <div id="cur-list"></div>
  `;

  // Inscripciones section
  const inscSect = document.createElement('div'); inscSect.setAttribute('data-tab','insc');
  inscSect.className = 'container-card';
  inscSect.innerHTML = `
    <h2>Inscribir</h2>
    <form id="insc-form">
      <select id="insc-est"></select>
      <select id="insc-curso"></select>
      <button type="submit">Inscribir</button>
    </form>
    <div id="insc-list"></div>
  `;

  // Right column: relations + stats
  const rightCol = document.createElement('div'); rightCol.className = 'container-card';
  rightCol.innerHTML = `
    <h2>Relaciones</h2>
    <div>
      <label>Ver cursos de estudiante: <select id="rel-est"><option value="">--seleccione--</option></select></label>
      <ul id="rel-est-list"></ul>
    </div>
    <div>
      <label>Ver estudiantes de curso: <select id="rel-cur"><option value="">--seleccione--</option></select></label>
      <ul id="rel-cur-list"></ul>
    </div>
  `;

  const grid = document.createElement('div'); grid.className = 'main';
  const left = document.createElement('div'); left.appendChild(dash); left.appendChild(estSect); left.appendChild(curSect); left.appendChild(inscSect);
  // Tools (search & filters)
  const tools = document.createElement('div');
  tools.innerHTML = `
    <div class="container-card">
      <h3>Buscar / Filtrar</h3>
      <input id="search-est" placeholder="Buscar estudiantes por nombre" />
      <select id="filter-est"><option value="all">Todos</option><option value="activo">Activos</option><option value="inactivo">Inactivos</option></select>
      <input id="search-cur" placeholder="Buscar cursos por nombre o sigla" />
      <select id="filter-cur"><option value="all">Todos</option><option value="disponible">Disponibles</option><option value="cerrado">Cerrados</option></select>
    </div>
  `;
  left.insertBefore(tools, estSect);
  grid.appendChild(left); grid.appendChild(rightCol);

  app.appendChild(container); app.appendChild(grid);
  applySavedTheme();
  bindEvents();
  await seedDataIfNeeded();
  showTab('dashboard');
  refreshAll();
}

async function seedDataIfNeeded(){
  // Only seed if empty
  const hasEst = estudianteSvc.getAll().length > 0;
  const hasCur = cursoSvc.getAll().length > 0;
  const hasInsc = inscSvc.getAll().length > 0;
  if (hasEst || hasCur || hasInsc) return;
  try{
    const res = await fetch('data/seed.json');
    if(!res.ok) throw new Error('No seed file');
    const json = await res.json();
    if (Array.isArray(json.estudiantes)) estudianteSvc.setAll(json.estudiantes);
    if (Array.isArray(json.cursos)) cursoSvc.setAll(json.cursos);
    if (Array.isArray(json.inscripciones)) inscSvc.setAll(json.inscripciones);
    showMessage('Datos iniciales cargados');
  }catch(err:any){
    console.warn('No se cargó seed:', err.message || err);
  }
}

// Show only the requested tab section
function showTab(tab: string){
  document.querySelectorAll('[data-tab]').forEach(el=>{
    if(el.getAttribute('data-tab') === tab) (el as HTMLElement).style.display = '';
    else (el as HTMLElement).style.display = 'none';
  });
}

// Listen for tab events from header
window.addEventListener('app:showTab', (e:any)=>{ if(e && e.detail) showTab(e.detail); });

// Bind header tabs and handle active class
function bindHeaderTabs(){
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(t=>{
    t.addEventListener('click', (ev)=>{
      tabs.forEach(x=>x.classList.remove('active'));
      const target = ev.currentTarget as HTMLElement;
      target.classList.add('active');
      const id = target.id.replace('tab-','');
      const evt = new CustomEvent('app:showTab', { detail: id });
      window.dispatchEvent(evt);
    });
  });
}

// run header binding now (header is static in index.html)
bindHeaderTabs();

function bindEvents(){
  const ef = q<HTMLFormElement>('#est-form');
  const cf = q<HTMLFormElement>('#cur-form');
  const insf = q<HTMLFormElement>('#insc-form');

  const modalCancel = q<HTMLButtonElement>('#modal-cancel');
  const modalConfirm = q<HTMLButtonElement>('#modal-confirm');
  if(modalCancel) modalCancel.addEventListener('click', closeModal);
  if(modalConfirm) {
    modalConfirm.addEventListener('click', ()=>{
      if(!modalAction) return;
      try{
        modalAction();
        closeModal();
      }catch(err:any){
        showMessage(err.message || String(err), true);
      }
    });
  }

  const btnDark = q<HTMLButtonElement>('#btn-dark');
  const btnExport = q<HTMLButtonElement>('#btn-export');
  const btnImport = q<HTMLButtonElement>('#btn-import');
  const inputImport = q<HTMLInputElement>('#input-import');
  if(btnDark) btnDark.addEventListener('click', toggleDarkMode);
  if(btnExport) btnExport.addEventListener('click', exportData);
  if(btnImport && inputImport) btnImport.addEventListener('click', ()=> inputImport.click());
  if(inputImport) {
    inputImport.addEventListener('change', ()=>{
      const file = inputImport.files && inputImport.files[0];
      if(file) importData(file);
      inputImport.value = '';
    });
  }

  if(ef) ef.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(ef);
    const nombre = (fd.get('nombre') as string||'').trim();
    const correo = (fd.get('correo') as string||'').trim();
    const edad = Number(fd.get('edad'));
    const carrera = (fd.get('carrera') as string||'').trim();
    try{
      if (!required(nombre) || !required(correo) || !required(String(edad)) || !required(carrera)) throw new Error('Todos los campos son requeridos');
      if (!isEmail(correo)) throw new Error('Email inválido');
      if (!isPositiveInteger(edad)) throw new Error('Edad inválida');
      if (editingEstId) {
        estudianteSvc.update(editingEstId, { nombre, correo, edad, carrera });
        editingEstId = null; q('#est-cancel')!.style.display = 'none';
        showMessage('Estudiante actualizado');
      } else {
        estudianteSvc.create({ nombre, correo, edad, carrera, estado: 'activo' });
        showMessage('Estudiante creado');
      }
      ef.reset(); refreshAll();
    }catch(err:any){ showMessage(err.message||String(err), true); }
  });

  if(cf) cf.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(cf);
    const nombre = (fd.get('nombre') as string||'').trim();
    const sigla = (fd.get('sigla') as string||'').trim();
    const docente = (fd.get('docente') as string||'').trim();
    const cupoMaximo = Number(fd.get('cupoMaximo'));
    try{
      if (!required(nombre) || !required(sigla) || !required(docente) || !required(String(cupoMaximo))) throw new Error('Todos los campos son requeridos');
      if (!isPositiveInteger(cupoMaximo)) throw new Error('Cupo máximo inválido');
      if (editingCurId) {
        cursoSvc.update(editingCurId, { nombre, sigla, docente, cupoMaximo });
        editingCurId = null; q('#cur-cancel')!.style.display = 'none';
        showMessage('Curso actualizado');
      } else {
        cursoSvc.create({ nombre, sigla, docente, cupoMaximo, estado: 'disponible' });
        showMessage('Curso creado');
      }
      cf.reset(); refreshAll();
    }catch(err:any){ showMessage(err.message||String(err), true); }
  });

  const estCancel = q<HTMLButtonElement>('#est-cancel');
  const curCancel = q<HTMLButtonElement>('#cur-cancel');
  if(estCancel) estCancel.addEventListener('click', ()=>{ editingEstId = null; (q('#est-form') as HTMLFormElement)?.reset(); estCancel.style.display='none'; });
  if(curCancel) curCancel.addEventListener('click', ()=>{ editingCurId = null; (q('#cur-form') as HTMLFormElement)?.reset(); curCancel.style.display='none'; });

  const selEst = q<HTMLSelectElement>('#insc-est');
  const selCur = q<HTMLSelectElement>('#insc-curso');
  if(insf && selEst && selCur) insf.addEventListener('submit', (e)=>{
    e.preventDefault();
    const estudianteId = Number(selEst.value);
    const cursoId = Number(selCur.value);
    try{
      const estudiante = estudianteSvc.findById(estudianteId);
      const curso = cursoSvc.findById(cursoId);
      if (!estudiante) throw new Error('Estudiante no encontrado');
      if (!curso) throw new Error('Curso no encontrado');
      if (estudiante.estado === 'inactivo') throw new Error('Estudiante inactivo');
      if (curso.estado === 'cerrado') throw new Error('Curso cerrado');
      const inscritos = inscSvc.countByCurso(cursoId);
      if (isPositiveInteger(curso.cupoMaximo) && inscritos >= curso.cupoMaximo) throw new Error('Cupo máximo alcanzado');
      inscSvc.create({ estudianteId, cursoId });
      showMessage('Inscripción exitosa');
      refreshAll();
    }catch(err:any){ showMessage(err.message||String(err), true); }
  });

  // Search and filter
  q('#search-est')?.addEventListener('input', refreshAll);
  q('#filter-est')?.addEventListener('change', refreshAll);
  q('#search-cur')?.addEventListener('input', refreshAll);
  q('#filter-cur')?.addEventListener('change', refreshAll);

  // relations selects
  q('#rel-est')?.addEventListener('change', (e)=>{ const id = Number((e.target as HTMLSelectElement).value); renderRelEst(id); });
  q('#rel-cur')?.addEventListener('change', (e)=>{ const id = Number((e.target as HTMLSelectElement).value); renderRelCur(id); });
}

function refreshAll(){
  renderLists();
  fillInsSelects();
  fillRelationsSelects();
  renderStats();
}

function fillInsSelects(){
  const selEst = q<HTMLSelectElement>('#insc-est');
  if(!selEst) return;
  selEst.innerHTML='';
  estudianteSvc.getAll().forEach(s=>{ const opt=document.createElement('option'); opt.value=String(s.id); opt.text=`${s.nombre} (${s.estado})`; selEst.appendChild(opt); });
  const selCur = q<HTMLSelectElement>('#insc-curso');
  if(!selCur) return;
  selCur.innerHTML='';
  cursoSvc.getAll().forEach(c=>{ const opt=document.createElement('option'); opt.value=String(c.id); opt.text=`${c.nombre} [${c.sigla}] (${c.estado})`; selCur.appendChild(opt); });
}

function fillRelationsSelects(){
  const relE = q<HTMLSelectElement>('#rel-est');
  const relC = q<HTMLSelectElement>('#rel-cur');
  if(!relE || !relC) return;
  relE.innerHTML='<option value="">--seleccione--</option>';
  estudianteSvc.getAll().forEach(s=>{ const o=document.createElement('option'); o.value=String(s.id); o.text=s.nombre; relE.appendChild(o); });
  relC.innerHTML='<option value="">--seleccione--</option>';
  cursoSvc.getAll().forEach(c=>{ const o=document.createElement('option'); o.value=String(c.id); o.text=c.nombre; relC.appendChild(o); });
}

function renderRelEst(id: number){
  const ul = q<HTMLUListElement>('#rel-est-list');
  if(!ul) return;
  ul.innerHTML='';
  if (!id) return;
  const ins = inscSvc.getAll().filter(i=>i.estudianteId===id && i.estado==='activa');
  ins.forEach(i=>{ const c = cursoSvc.findById(i.cursoId); const li=document.createElement('li'); li.textContent = c ? `${c.nombre} [${c.sigla}]` : `Curso ${i.cursoId}`; ul.appendChild(li); });
}

function renderRelCur(id: number){
  const ul = q<HTMLUListElement>('#rel-cur-list');
  if(!ul) return;
  ul.innerHTML='';
  if (!id) return;
  const ins = inscSvc.getAll().filter(i=>i.cursoId===id && i.estado==='activa');
  ins.forEach(i=>{ const s = estudianteSvc.findById(i.estudianteId); const li=document.createElement('li'); li.textContent = s ? `${s.nombre} (${s.correo})` : `Est ${i.estudianteId}`; ul.appendChild(li); });
}

function renderStats(){
  // Dashboard con tarjetas resumen y conteo por curso
  const cards = q<HTMLDivElement>('#dashboard-cards');
  if (!cards) return;
  const summary = q<HTMLDivElement>('#dashboard-summary');
  cards.innerHTML = '';
  if(summary) summary.innerHTML = '';
  const totalEst = estudianteSvc.getAll().length;
  const totalCur = cursoSvc.getAll().length;
  const inscripciones = inscSvc.getAll().filter(i=>i.estado === 'activa');
  const uniqueEst = new Set<number>(inscripciones.map(i=>i.estudianteId));
  const totalInscritos = uniqueEst.size;
  const build = (title:string, value:string)=>{ const c=document.createElement('div'); c.className='card'; c.innerHTML=`<h3>${title}</h3><p>${value}</p>`; return c; };
  cards.appendChild(build('Total estudiantes', String(totalEst)));
  cards.appendChild(build('Total cursos', String(totalCur)));
  cards.appendChild(build('Alumnos inscritos', String(totalInscritos)));
  const cursos = cursoSvc.getAll();
  cursos.forEach(c=>{
    const cnt = inscripciones.filter(i=>i.cursoId === c.id).length;
    cards.appendChild(build(`${c.nombre} (${c.sigla})`, String(cnt)));
  });
  if(summary){
    summary.textContent = `Inscripciones activas: ${inscripciones.length}. Estudiantes con al menos una inscripción: ${totalInscritos}.`;
  }
}

function renderLists(){
  const estContainer = q<HTMLElement>('#est-list');
  const curContainer = q<HTMLElement>('#cur-list');
  const insContainer = q<HTMLElement>('#insc-list');
  if(estContainer) estContainer.innerHTML = '';
  if(curContainer) curContainer.innerHTML = '';
  if(insContainer) insContainer.innerHTML = '';
  const searchEst = (q<HTMLInputElement>('#search-est')?.value||'').toLowerCase();
  const filterEst = (q<HTMLSelectElement>('#filter-est')?.value||'all');
  const searchCur = (q<HTMLInputElement>('#search-cur')?.value||'').toLowerCase();
  const filterCur = (q<HTMLSelectElement>('#filter-cur')?.value||'all');

  // Estudiantes
  if(estContainer){
    const estSection = document.createElement('section'); estSection.innerHTML='<h2>Estudiantes</h2>';
    const tableE = document.createElement('table');
    tableE.innerHTML = '<tr><th data-sort-est="nombre">Nombre</th><th data-sort-est="correo">Correo</th><th data-sort-est="edad">Edad</th><th data-sort-est="carrera">Carrera</th><th data-sort-est="estado">Estado</th><th>Acciones</th></tr>';
    const estRows = estudianteSvc.getAll().filter(s=> (s.nombre.toLowerCase().includes(searchEst)) && (filterEst==='all' || s.estado===filterEst));
    estRows.sort((a,b)=> compareValues(a[estSort.key] as string|number, b[estSort.key] as string|number, estSort.dir));
    estRows.forEach(s=>{
    const tr=document.createElement('tr'); tr.innerHTML = `<td>${s.nombre}</td><td>${s.correo}</td><td>${s.edad}</td><td>${s.carrera}</td><td>${s.estado}</td>`;
    const td=document.createElement('td');
    const btnEdit=document.createElement('button'); btnEdit.textContent='Editar'; btnEdit.addEventListener('click', ()=>{ showEditEstudianteModal(s.id); });
    const btnDel=document.createElement('button'); btnDel.textContent='Eliminar'; btnDel.addEventListener('click', ()=>{ showConfirmModal('Eliminar estudiante?', ()=>{ estudianteSvc.delete(s.id); inscSvc.getAll().filter(i=>i.estudianteId===s.id).forEach(i=>inscSvc.delete(i.id)); refreshAll(); showMessage('Estudiante eliminado'); }); });
    const btnToggle=document.createElement('button'); btnToggle.textContent='Toggle estado'; btnToggle.addEventListener('click', ()=>{ estudianteSvc.toggleEstado(s.id); refreshAll(); });
    td.appendChild(btnEdit); td.appendChild(btnToggle); td.appendChild(btnDel); tr.appendChild(td); tableE.appendChild(tr);
    });
    tableE.querySelectorAll('th[data-sort-est]').forEach(th=>{
      th.addEventListener('click', ()=>{
        const key = th.getAttribute('data-sort-est') as typeof estSort.key;
        estSort = estSort.key === key ? { key, dir: (estSort.dir * -1) as 1|-1 } : { key, dir: 1 };
        refreshAll();
      });
      (th as HTMLElement).style.cursor = 'pointer';
    });
    estSection.appendChild(tableE); estContainer.appendChild(estSection);
  }

  // Cursos
  if(curContainer){
    const curSection = document.createElement('section'); curSection.innerHTML='<h2>Cursos</h2>';
    const tableC = document.createElement('table'); tableC.innerHTML = '<tr><th data-sort-cur="nombre">Nombre</th><th data-sort-cur="sigla">Sigla</th><th data-sort-cur="docente">Docente</th><th data-sort-cur="cupoMaximo">Cupo</th><th data-sort-cur="estado">Estado</th><th>Acciones</th></tr>';
    const curRows = cursoSvc.getAll().filter(c=> (c.nombre.toLowerCase().includes(searchCur) || c.sigla.toLowerCase().includes(searchCur)) && (filterCur==='all' || c.estado===filterCur));
    curRows.sort((a,b)=> compareValues(a[curSort.key] as string|number, b[curSort.key] as string|number, curSort.dir));
    curRows.forEach(c=>{
    const tr=document.createElement('tr'); tr.innerHTML = `<td>${c.nombre}</td><td>${c.sigla}</td><td>${c.docente}</td><td>${c.cupoMaximo}</td><td>${c.estado}</td>`;
    const td=document.createElement('td');
    const btnEdit=document.createElement('button'); btnEdit.textContent='Editar'; btnEdit.addEventListener('click', ()=>{ showEditCursoModal(c.id); });
    const btnDel=document.createElement('button'); btnDel.textContent='Eliminar'; btnDel.addEventListener('click', ()=>{ showConfirmModal('Eliminar curso?', ()=>{ cursoSvc.delete(c.id); inscSvc.getAll().filter(i=>i.cursoId===c.id).forEach(i=>inscSvc.delete(i.id)); refreshAll(); showMessage('Curso eliminado'); }); });
    const btnToggle=document.createElement('button'); btnToggle.textContent='Toggle estado'; btnToggle.addEventListener('click', ()=>{ cursoSvc.toggleEstado(c.id); refreshAll(); });
    td.appendChild(btnEdit); td.appendChild(btnToggle); td.appendChild(btnDel); tr.appendChild(td); tableC.appendChild(tr);
    });
    tableC.querySelectorAll('th[data-sort-cur]').forEach(th=>{
      th.addEventListener('click', ()=>{
        const key = th.getAttribute('data-sort-cur') as typeof curSort.key;
        curSort = curSort.key === key ? { key, dir: (curSort.dir * -1) as 1|-1 } : { key, dir: 1 };
        refreshAll();
      });
      (th as HTMLElement).style.cursor = 'pointer';
    });
    curSection.appendChild(tableC); curContainer.appendChild(curSection);
  }

  // Inscripciones
  if(insContainer){
    const insSection = document.createElement('section'); insSection.innerHTML = '<h2>Inscripciones</h2>';
    const tableI = document.createElement('table'); tableI.innerHTML = '<tr><th data-sort-ins="estudiante">Estudiante</th><th data-sort-ins="curso">Curso</th><th data-sort-ins="fecha">Fecha</th><th data-sort-ins="estado">Estado</th><th>Acciones</th></tr>';
    const insRows = inscSvc.getAll().map(i=>{
      const est = estudianteSvc.findById(i.estudianteId);
      const cur = cursoSvc.findById(i.cursoId);
      return { raw: i, estudiante: est?est.nombre:String(i.estudianteId), curso: cur?cur.nombre:String(i.cursoId) };
    });
    insRows.sort((a,b)=>{
      if(insSort.key === 'estudiante') return compareValues(a.estudiante, b.estudiante, insSort.dir);
      if(insSort.key === 'curso') return compareValues(a.curso, b.curso, insSort.dir);
      if(insSort.key === 'estado') return compareValues(a.raw.estado, b.raw.estado, insSort.dir);
      return compareValues(a.raw.fecha, b.raw.fecha, insSort.dir);
    });
    insRows.forEach(({ raw, estudiante, curso })=>{
    const i = raw;
    const tr=document.createElement('tr'); tr.innerHTML = `<td>${estudiante}</td><td>${curso}</td><td>${i.fecha}</td><td>${i.estado}</td>`;
    const td=document.createElement('td');
    const btnDel=document.createElement('button'); btnDel.textContent='Eliminar'; btnDel.addEventListener('click', ()=>{ showConfirmModal('Eliminar inscripcion?', ()=>{ inscSvc.delete(i.id); refreshAll(); showMessage('Inscripción eliminada'); }); });
    const btnCancel=document.createElement('button'); btnCancel.textContent='Cancelar'; btnCancel.addEventListener('click', ()=>{ try{ inscSvc.cancel(i.id); refreshAll(); showMessage('Inscripción cancelada'); }catch(err:any){ showMessage(err.message, true); } });
    td.appendChild(btnCancel); td.appendChild(btnDel); tr.appendChild(td); tableI.appendChild(tr);
    });
    tableI.querySelectorAll('th[data-sort-ins]').forEach(th=>{
      th.addEventListener('click', ()=>{
        const key = th.getAttribute('data-sort-ins') as typeof insSort.key;
        insSort = insSort.key === key ? { key, dir: (insSort.dir * -1) as 1|-1 } : { key, dir: 1 };
        refreshAll();
      });
      (th as HTMLElement).style.cursor = 'pointer';
    });
    insSection.appendChild(tableI); insContainer.appendChild(insSection);
  }
}

function startEditEst(id:number){
  const est = estudianteSvc.findById(id); if(!est) return;
  editingEstId = id;
  const form = q<HTMLFormElement>('#est-form')!;
  (form.elements.namedItem('nombre') as HTMLInputElement).value = est.nombre;
  (form.elements.namedItem('correo') as HTMLInputElement).value = est.correo;
  (form.elements.namedItem('edad') as HTMLInputElement).value = String(est.edad);
  (form.elements.namedItem('carrera') as HTMLInputElement).value = est.carrera;
  q('#est-cancel')!.style.display = 'inline-block';
}

function startEditCur(id:number){
  const cur = cursoSvc.findById(id); if(!cur) return;
  editingCurId = id;
  const form = q<HTMLFormElement>('#cur-form')!;
  (form.elements.namedItem('nombre') as HTMLInputElement).value = cur.nombre;
  (form.elements.namedItem('sigla') as HTMLInputElement).value = cur.sigla;
  (form.elements.namedItem('docente') as HTMLInputElement).value = cur.docente;
  (form.elements.namedItem('cupoMaximo') as HTMLInputElement).value = String(cur.cupoMaximo);
  q('#cur-cancel')!.style.display = 'inline-block';
}

buildUI();