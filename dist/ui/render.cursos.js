export function renderCursos(container, cursos) {
    const section = document.createElement('section');
    section.innerHTML = '<h2>Cursos</h2>';
    const ul = document.createElement('ul');
    cursos.forEach(c => {
        const li = document.createElement('li');
        li.textContent = c.nombre;
        ul.appendChild(li);
    });
    section.appendChild(ul);
    container.appendChild(section);
}
