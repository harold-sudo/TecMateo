"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const estudiante_service_1 = require("./services/estudiante.service");
const curso_service_1 = require("./services/curso.service");
const inscripcion_service_1 = require("./services/inscripcion.service");
const validators_1 = require("./utils/validators");
const estudianteSvc = new estudiante_service_1.EstudianteService();
const cursoSvc = new curso_service_1.CursoService();
const inscSvc = new inscripcion_service_1.InscripcionService();
let editingEstId = null;
let editingCurId = null;
function q(sel, parent = document) {
    return parent.querySelector(sel);
}
function showMessage(msg, isError = false) {
    const box = q('#msg');
    if (box) {
        box.textContent = msg;
        box.style.color = isError ? 'crimson' : 'green';
        setTimeout(() => { box.textContent = ''; }, 3000);
    }
    else
        alert(msg);
}
async function buildUI() {
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
    const container = document.createElement('div');
    container.className = 'container-card';
    container.innerHTML = `<h1>Sistema Académico</h1><div id="msg" role="status" class="msg"></div>`;
    // Dashboard section
    const dash = document.createElement('div');
    dash.setAttribute('data-tab', 'dashboard');
    dash.className = 'container-card';
    dash.innerHTML = `
    <div class="cards" id="dashboard-cards"></div>
    <h3>Crear rápido</h3>
    <div class="dashboard-quick">
      <form id="dash-est-form" class="quick-form">
        <h4>Nuevo Estudiante</h4>
        <input name="nombre" placeholder="Nombre" required />
        <input name="correo" placeholder="Correo" required />
        <button type="submit">Crear estudiante</button>
      </form>
      <form id="dash-cur-form" class="quick-form">
        <h4>Nuevo Curso</h4>
        <input name="nombre" placeholder="Nombre curso" required />
        <input name="sigla" placeholder="Sigla" required />
        <button type="submit">Crear curso</button>
      </form>
    </div>
    <h3>Resumen</h3>
    <div id="dashboard-summary"></div>
  `;
    // Students section
    const estSect = document.createElement('div');
    estSect.setAttribute('data-tab', 'est');
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
    const curSect = document.createElement('div');
    curSect.setAttribute('data-tab', 'cur');
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
    const inscSect = document.createElement('div');
    inscSect.setAttribute('data-tab', 'insc');
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
    const rightCol = document.createElement('div');
    rightCol.className = 'container-card';
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
    <h2>Estadísticas</h2>
    <ul id="stats"></ul>
  `;
    const grid = document.createElement('div');
    grid.className = 'main';
    const left = document.createElement('div');
    left.appendChild(dash);
    left.appendChild(estSect);
    left.appendChild(curSect);
    left.appendChild(inscSect);
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
    grid.appendChild(left);
    grid.appendChild(rightCol);
    app.appendChild(container);
    app.appendChild(grid);
    bindEvents();
    await seedDataIfNeeded();
    showTab('dashboard');
    refreshAll();
}
async function seedDataIfNeeded() {
    // Only seed if empty
    const hasEst = estudianteSvc.getAll().length > 0;
    const hasCur = cursoSvc.getAll().length > 0;
    const hasInsc = inscSvc.getAll().length > 0;
    if (hasEst || hasCur || hasInsc)
        return;
    try {
        const res = await fetch('data/seed.json');
        if (!res.ok)
            throw new Error('No seed file');
        const json = await res.json();
        if (Array.isArray(json.estudiantes))
            estudianteSvc.setAll(json.estudiantes);
        if (Array.isArray(json.cursos))
            cursoSvc.setAll(json.cursos);
        if (Array.isArray(json.inscripciones))
            inscSvc.setAll(json.inscripciones);
        showMessage('Datos iniciales cargados');
    }
    catch (err) {
        console.warn('No se cargó seed:', err.message || err);
    }
}
// Show only the requested tab section
function showTab(tab) {
    document.querySelectorAll('[data-tab]').forEach(el => {
        if (el.getAttribute('data-tab') === tab)
            el.style.display = '';
        else
            el.style.display = 'none';
    });
}
// Listen for tab events from header
window.addEventListener('app:showTab', (e) => { if (e && e.detail)
    showTab(e.detail); });
// Bind header tabs and handle active class
function bindHeaderTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => {
        t.addEventListener('click', (ev) => {
            tabs.forEach(x => x.classList.remove('active'));
            const target = ev.currentTarget;
            target.classList.add('active');
            const id = target.id.replace('tab-', '');
            const evt = new CustomEvent('app:showTab', { detail: id });
            window.dispatchEvent(evt);
        });
    });
}
// run header binding now (header is static in index.html)
bindHeaderTabs();
function bindEvents() {
    const ef = q('#est-form');
    const cf = q('#cur-form');
    const insf = q('#insc-form');
    ef.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(ef);
        const nombre = (fd.get('nombre') || '').trim();
        const correo = (fd.get('correo') || '').trim();
        const edad = Number(fd.get('edad'));
        const carrera = (fd.get('carrera') || '').trim();
        try {
            if (!(0, validators_1.required)(nombre) || !(0, validators_1.required)(correo) || !(0, validators_1.required)(String(edad)) || !(0, validators_1.required)(carrera))
                throw new Error('Todos los campos son requeridos');
            if (!(0, validators_1.isEmail)(correo))
                throw new Error('Email inválido');
            if (!(0, validators_1.isPositiveInteger)(edad))
                throw new Error('Edad inválida');
            if (editingEstId) {
                estudianteSvc.update(editingEstId, { nombre, correo, edad, carrera });
                editingEstId = null;
                q('#est-cancel').style.display = 'none';
                showMessage('Estudiante actualizado');
            }
            else {
                estudianteSvc.create({ nombre, correo, edad, carrera, estado: 'activo' });
                showMessage('Estudiante creado');
            }
            ef.reset();
            refreshAll();
        }
        catch (err) {
            showMessage(err.message || String(err), true);
        }
    });
    cf.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(cf);
        const nombre = (fd.get('nombre') || '').trim();
        const sigla = (fd.get('sigla') || '').trim();
        const docente = (fd.get('docente') || '').trim();
        const cupoMaximo = Number(fd.get('cupoMaximo'));
        try {
            if (!(0, validators_1.required)(nombre) || !(0, validators_1.required)(sigla) || !(0, validators_1.required)(docente) || !(0, validators_1.required)(String(cupoMaximo)))
                throw new Error('Todos los campos son requeridos');
            if (!(0, validators_1.isPositiveInteger)(cupoMaximo))
                throw new Error('Cupo máximo inválido');
            if (editingCurId) {
                cursoSvc.update(editingCurId, { nombre, sigla, docente, cupoMaximo });
                editingCurId = null;
                q('#cur-cancel').style.display = 'none';
                showMessage('Curso actualizado');
            }
            else {
                cursoSvc.create({ nombre, sigla, docente, cupoMaximo, estado: 'disponible' });
                showMessage('Curso creado');
            }
            cf.reset();
            refreshAll();
        }
        catch (err) {
            showMessage(err.message || String(err), true);
        }
    });
    // Quick-create forms on dashboard
    const dashEst = q('#dash-est-form');
    const dashCur = q('#dash-cur-form');
    if (dashEst) {
        dashEst.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(dashEst);
            const nombre = (fd.get('nombre') || '').trim();
            const correo = (fd.get('correo') || '').trim();
            try {
                if (!(0, validators_1.required)(nombre) || !(0, validators_1.required)(correo))
                    throw new Error('Todos los campos son requeridos');
                if (!(0, validators_1.isEmail)(correo))
                    throw new Error('Email inválido');
                // defaults for quick create
                estudianteSvc.create({ nombre, correo, edad: 18, carrera: 'General', estado: 'activo' });
                showMessage('Estudiante creado');
                dashEst.reset();
                refreshAll();
            }
            catch (err) {
                showMessage(err.message || String(err), true);
            }
        });
    }
    if (dashCur) {
        dashCur.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(dashCur);
            const nombre = (fd.get('nombre') || '').trim();
            const sigla = (fd.get('sigla') || '').trim();
            try {
                if (!(0, validators_1.required)(nombre) || !(0, validators_1.required)(sigla))
                    throw new Error('Todos los campos son requeridos');
                // defaults for quick create
                cursoSvc.create({ nombre, sigla, docente: 'TBD', cupoMaximo: 30, estado: 'disponible' });
                showMessage('Curso creado');
                dashCur.reset();
                refreshAll();
            }
            catch (err) {
                showMessage(err.message || String(err), true);
            }
        });
    }
    q('#est-cancel').addEventListener('click', () => { editingEstId = null; q('#est-form').reset(); q('#est-cancel').style.display = 'none'; });
    q('#cur-cancel').addEventListener('click', () => { editingCurId = null; q('#cur-form').reset(); q('#cur-cancel').style.display = 'none'; });
    const selEst = q('#insc-est');
    const selCur = q('#insc-curso');
    insf.addEventListener('submit', (e) => {
        e.preventDefault();
        const estudianteId = Number(selEst.value);
        const cursoId = Number(selCur.value);
        try {
            const estudiante = estudianteSvc.findById(estudianteId);
            const curso = cursoSvc.findById(cursoId);
            if (!estudiante)
                throw new Error('Estudiante no encontrado');
            if (!curso)
                throw new Error('Curso no encontrado');
            if (estudiante.estado === 'inactivo')
                throw new Error('Estudiante inactivo');
            if (curso.estado === 'cerrado')
                throw new Error('Curso cerrado');
            const inscritos = inscSvc.countByCurso(cursoId);
            if ((0, validators_1.isPositiveInteger)(curso.cupoMaximo) && inscritos >= curso.cupoMaximo)
                throw new Error('Cupo máximo alcanzado');
            inscSvc.create({ estudianteId, cursoId });
            showMessage('Inscripción exitosa');
            refreshAll();
        }
        catch (err) {
            showMessage(err.message || String(err), true);
        }
    });
    // Search and filter
    q('#search-est').addEventListener('input', refreshAll);
    q('#filter-est').addEventListener('change', refreshAll);
    q('#search-cur').addEventListener('input', refreshAll);
    q('#filter-cur').addEventListener('change', refreshAll);
    // relations selects
    q('#rel-est').addEventListener('change', (e) => { const id = Number(e.target.value); renderRelEst(id); });
    q('#rel-cur').addEventListener('change', (e) => { const id = Number(e.target.value); renderRelCur(id); });
}
function refreshAll() {
    renderLists();
    fillInsSelects();
    fillRelationsSelects();
    renderStats();
}
function fillInsSelects() {
    const selEst = q('#insc-est');
    selEst.innerHTML = '';
    estudianteSvc.getAll().forEach(s => { const opt = document.createElement('option'); opt.value = String(s.id); opt.text = `${s.nombre} (${s.estado})`; selEst.appendChild(opt); });
    const selCur = q('#insc-curso');
    selCur.innerHTML = '';
    cursoSvc.getAll().forEach(c => { const opt = document.createElement('option'); opt.value = String(c.id); opt.text = `${c.nombre} [${c.sigla}] (${c.estado})`; selCur.appendChild(opt); });
}
function fillRelationsSelects() {
    const relE = q('#rel-est');
    relE.innerHTML = '<option value="">--seleccione--</option>';
    estudianteSvc.getAll().forEach(s => { const o = document.createElement('option'); o.value = String(s.id); o.text = s.nombre; relE.appendChild(o); });
    const relC = q('#rel-cur');
    relC.innerHTML = '<option value="">--seleccione--</option>';
    cursoSvc.getAll().forEach(c => { const o = document.createElement('option'); o.value = String(c.id); o.text = c.nombre; relC.appendChild(o); });
}
function renderRelEst(id) {
    const ul = q('#rel-est-list');
    ul.innerHTML = '';
    if (!id)
        return;
    const ins = inscSvc.getAll().filter(i => i.estudianteId === id && i.estado === 'activa');
    ins.forEach(i => { const c = cursoSvc.findById(i.cursoId); const li = document.createElement('li'); li.textContent = c ? `${c.nombre} [${c.sigla}]` : `Curso ${i.cursoId}`; ul.appendChild(li); });
}
function renderRelCur(id) {
    const ul = q('#rel-cur-list');
    ul.innerHTML = '';
    if (!id)
        return;
    const ins = inscSvc.getAll().filter(i => i.cursoId === id && i.estado === 'activa');
    ins.forEach(i => { const s = estudianteSvc.findById(i.estudianteId); const li = document.createElement('li'); li.textContent = s ? `${s.nombre} (${s.correo})` : `Est ${i.estudianteId}`; ul.appendChild(li); });
}
function renderStats() {
    // Mostrar únicamente: cantidad de alumnos inscritos (únicos) y conteo por curso
    const cards = q('#dashboard-cards');
    if (!cards)
        return;
    cards.innerHTML = '';
    const inscripciones = inscSvc.getAll().filter(i => i.estado === 'activa');
    const uniqueEst = new Set(inscripciones.map(i => i.estudianteId));
    const totalInscritos = uniqueEst.size;
    const build = (title, value) => { const c = document.createElement('div'); c.className = 'card'; c.innerHTML = `<h3>${title}</h3><p>${value}</p>`; return c; };
    // Card con total de alumnos inscritos
    cards.appendChild(build('Alumnos inscritos', String(totalInscritos)));
    // Cards por curso con su cantidad de inscritos activos
    const cursos = cursoSvc.getAll();
    cursos.forEach(c => {
        const cnt = inscripciones.filter(i => i.cursoId === c.id).length;
        cards.appendChild(build(`${c.nombre} (${c.sigla})`, String(cnt)));
    });
}
function renderLists() {
    const estContainer = q('#est-list');
    estContainer.innerHTML = '';
    const curContainer = q('#cur-list');
    curContainer.innerHTML = '';
    const insContainer = q('#insc-list');
    insContainer.innerHTML = '';
    const searchEst = (q('#search-est').value || '').toLowerCase();
    const filterEst = (q('#filter-est').value || 'all');
    const searchCur = (q('#search-cur').value || '').toLowerCase();
    const filterCur = (q('#filter-cur').value || 'all');
    // Estudiantes
    const estSection = document.createElement('section');
    estSection.innerHTML = '<h2>Estudiantes</h2>';
    const tableE = document.createElement('table');
    tableE.innerHTML = '<tr><th>Nombre</th><th>Correo</th><th>Edad</th><th>Carrera</th><th>Estado</th><th>Acciones</th></tr>';
    estudianteSvc.getAll().filter(s => (s.nombre.toLowerCase().includes(searchEst)) && (filterEst === 'all' || s.estado === filterEst)).forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${s.nombre}</td><td>${s.correo}</td><td>${s.edad}</td><td>${s.carrera}</td><td>${s.estado}</td>`;
        const td = document.createElement('td');
        const btnEdit = document.createElement('button');
        btnEdit.textContent = 'Editar';
        btnEdit.addEventListener('click', () => { startEditEst(s.id); });
        const btnDel = document.createElement('button');
        btnDel.textContent = 'Eliminar';
        btnDel.addEventListener('click', () => { if (confirm('Eliminar estudiante?')) {
            estudianteSvc.delete(s.id);
            inscSvc.getAll().filter(i => i.estudianteId === s.id).forEach(i => inscSvc.delete(i.id));
            refreshAll();
            showMessage('Estudiante eliminado');
        } });
        const btnToggle = document.createElement('button');
        btnToggle.textContent = 'Toggle estado';
        btnToggle.addEventListener('click', () => { estudianteSvc.toggleEstado(s.id); refreshAll(); });
        td.appendChild(btnEdit);
        td.appendChild(btnToggle);
        td.appendChild(btnDel);
        tr.appendChild(td);
        tableE.appendChild(tr);
    });
    estSection.appendChild(tableE);
    estContainer.appendChild(estSection);
    // Cursos
    const curSection = document.createElement('section');
    curSection.innerHTML = '<h2>Cursos</h2>';
    const tableC = document.createElement('table');
    tableC.innerHTML = '<tr><th>Nombre</th><th>Sigla</th><th>Docente</th><th>Cupo</th><th>Estado</th><th>Acciones</th></tr>';
    cursoSvc.getAll().filter(c => (c.nombre.toLowerCase().includes(searchCur) || c.sigla.toLowerCase().includes(searchCur)) && (filterCur === 'all' || c.estado === filterCur)).forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${c.nombre}</td><td>${c.sigla}</td><td>${c.docente}</td><td>${c.cupoMaximo}</td><td>${c.estado}</td>`;
        const td = document.createElement('td');
        const btnEdit = document.createElement('button');
        btnEdit.textContent = 'Editar';
        btnEdit.addEventListener('click', () => { startEditCur(c.id); });
        const btnDel = document.createElement('button');
        btnDel.textContent = 'Eliminar';
        btnDel.addEventListener('click', () => { if (confirm('Eliminar curso?')) {
            cursoSvc.delete(c.id);
            inscSvc.getAll().filter(i => i.cursoId === c.id).forEach(i => inscSvc.delete(i.id));
            refreshAll();
            showMessage('Curso eliminado');
        } });
        const btnToggle = document.createElement('button');
        btnToggle.textContent = 'Toggle estado';
        btnToggle.addEventListener('click', () => { cursoSvc.toggleEstado(c.id); refreshAll(); });
        td.appendChild(btnEdit);
        td.appendChild(btnToggle);
        td.appendChild(btnDel);
        tr.appendChild(td);
        tableC.appendChild(tr);
    });
    curSection.appendChild(tableC);
    curContainer.appendChild(curSection);
    // Inscripciones
    const insSection = document.createElement('section');
    insSection.innerHTML = '<h2>Inscripciones</h2>';
    const tableI = document.createElement('table');
    tableI.innerHTML = '<tr><th>Estudiante</th><th>Curso</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr>';
    inscSvc.getAll().forEach(i => {
        const est = estudianteSvc.findById(i.estudianteId);
        const cur = cursoSvc.findById(i.cursoId);
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${est ? est.nombre : i.estudianteId}</td><td>${cur ? cur.nombre : i.cursoId}</td><td>${i.fecha}</td><td>${i.estado}</td>`;
        const td = document.createElement('td');
        const btnDel = document.createElement('button');
        btnDel.textContent = 'Eliminar';
        btnDel.addEventListener('click', () => { if (confirm('Eliminar inscripcion?')) {
            inscSvc.delete(i.id);
            refreshAll();
            showMessage('Inscripción eliminada');
        } });
        const btnCancel = document.createElement('button');
        btnCancel.textContent = 'Cancelar';
        btnCancel.addEventListener('click', () => { try {
            inscSvc.cancel(i.id);
            refreshAll();
            showMessage('Inscripción cancelada');
        }
        catch (err) {
            showMessage(err.message, true);
        } });
        td.appendChild(btnCancel);
        td.appendChild(btnDel);
        tr.appendChild(td);
        tableI.appendChild(tr);
    });
    insSection.appendChild(tableI);
    insContainer.appendChild(insSection);
}
function startEditEst(id) {
    const est = estudianteSvc.findById(id);
    if (!est)
        return;
    editingEstId = id;
    const form = q('#est-form');
    form.elements.namedItem('nombre').value = est.nombre;
    form.elements.namedItem('correo').value = est.correo;
    form.elements.namedItem('edad').value = String(est.edad);
    form.elements.namedItem('carrera').value = est.carrera;
    q('#est-cancel').style.display = 'inline-block';
}
function startEditCur(id) {
    const cur = cursoSvc.findById(id);
    if (!cur)
        return;
    editingCurId = id;
    const form = q('#cur-form');
    form.elements.namedItem('nombre').value = cur.nombre;
    form.elements.namedItem('sigla').value = cur.sigla;
    form.elements.namedItem('docente').value = cur.docente;
    form.elements.namedItem('cupoMaximo').value = String(cur.cupoMaximo);
    q('#cur-cancel').style.display = 'inline-block';
}
buildUI();
