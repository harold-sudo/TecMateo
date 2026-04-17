import { Inscripcion } from "../models/inscripcion.js";
import { BaseService } from "./base.service.js";

const KEY = 'inscripciones';

export class InscripcionService extends BaseService<Inscripcion> {
  constructor(){ super(KEY); }

  find(studentId: number, cursoId: number){
    return this.getAll().find(i => i.estudianteId === studentId && i.cursoId === cursoId);
  }

  countByCurso(cursoId: number){
    return this.getAll().filter(i => i.cursoId === cursoId).length;
  }

  create(data: Omit<Inscripcion,'id'|'fecha'|'estado'>): Inscripcion {
    if (this.find(data.estudianteId, data.cursoId)) throw new Error('Inscripción duplicada');
    const nueva = { fecha: new Date().toISOString(), estado: 'activa', ...(data as object) } as Omit<Inscripcion,'id'>;
    return super.add(nueva);
  }

  cancel(id: number){
    return this.update(id, { estado: 'cancelada' });
  }
}