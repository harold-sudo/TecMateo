import { Estudiante } from "../models/estudiante";

export function renderEstudiantes(container: HTMLElement, estudiantes: Estudiante[]){
  const section = document.createElement('section');
  section.innerHTML = '<h2>Estudiantes</h2>';
  const ul = document.createElement('ul');
  estudiantes.forEach(e => {
    const li = document.createElement('li');
    li.textContent = `${e.nombre} ${e.correo ? '('+e.correo+')' : ''}`;
    ul.appendChild(li);
  });
  section.appendChild(ul);
  container.appendChild(section);
}