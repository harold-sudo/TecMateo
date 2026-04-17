import { Estudiante } from "../models/estudiante";
import { BaseService } from "./base.service";

const KEY = 'estudiantes';

export class EstudianteService extends BaseService<Estudiante> {
  constructor(){ super(KEY); }

  findByEmail(email: string): Estudiante | undefined {
    return this.getAll().find(s => s.correo === email);
  }

  create(data: Omit<Estudiante,'id'>): Estudiante {
    if (this.findByEmail(data.correo)) throw new Error('El correo ya está en uso');
    return super.add(data);
  }

  update(id: number, changes: Partial<Omit<Estudiante,'id'>>): Estudiante {
    const items = this.getAll();
    if (changes.correo) {
      const other = items.find(i => i.correo === changes.correo && i.id !== id);
      if (other) throw new Error('El correo ya está en uso');
    }
    return super.update(id, changes);
  }

  toggleEstado(id: number){
    const student = this.findById(id);
    if (!student) throw new Error('Estudiante no encontrado');
    const nuevoEstado = student.estado === 'activo' ? 'inactivo' : 'activo';
    return this.update(id, { estado: nuevoEstado });
  }
}