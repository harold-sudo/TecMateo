"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderEstudiantes = renderEstudiantes;
function renderEstudiantes(container, estudiantes) {
    const section = document.createElement('section');
    section.innerHTML = '<h2>Estudiantes</h2>';
    const ul = document.createElement('ul');
    estudiantes.forEach(e => {
        const li = document.createElement('li');
        li.textContent = `${e.nombre} ${e.correo ? '(' + e.correo + ')' : ''}`;
        ul.appendChild(li);
    });
    section.appendChild(ul);
    container.appendChild(section);
}
