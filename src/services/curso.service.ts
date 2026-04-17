import { Curso } from "../models/curso.js";
import { BaseService } from "./base.service.js";

const KEY = 'cursos';

export class CursoService extends BaseService<Curso> {
  constructor(){ super(KEY); }

  findBySigla(sigla: string): Curso | undefined {
    return this.getAll().find(c => c.sigla === sigla);
  }

  create(data: Omit<Curso,'id'>): Curso {
    if (this.findBySigla(data.sigla)) throw new Error('La sigla ya existe');
    return super.add(data);
  }

  update(id: number, changes: Partial<Omit<Curso,'id'>>): Curso {
    const items = this.getAll();
    if (changes.sigla) {
      const other = items.find(i => i.sigla === changes.sigla && i.id !== id);
      if (other) throw new Error('La sigla ya existe');
    }
    return super.update(id, changes);
  }

  toggleEstado(id: number){
    const curso = this.findById(id);
    if (!curso) throw new Error('Curso no encontrado');
    const nuevo = curso.estado === 'disponible' ? 'cerrado' : 'disponible';
    return this.update(id, { estado: nuevo });
  }
}