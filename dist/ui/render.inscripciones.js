export function renderInscripciones(container, inscripciones) {
    const section = document.createElement('section');
    section.innerHTML = '<h2>Inscripciones</h2>';
    const ul = document.createElement('ul');
    inscripciones.forEach(i => {
        const li = document.createElement('li');
        li.textContent = `${i.estudianteId} → ${i.cursoId} (${i.fecha})`;
        ul.appendChild(li);
    });
    section.appendChild(ul);
    container.appendChild(section);
}
