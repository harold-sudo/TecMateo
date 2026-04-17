import { BaseService } from "./base.service.js";
const KEY = 'inscripciones';
export class InscripcionService extends BaseService {
    constructor() { super(KEY); }
    find(studentId, cursoId) {
        return this.getAll().find(i => i.estudianteId === studentId && i.cursoId === cursoId);
    }
    countByCurso(cursoId) {
        return this.getAll().filter(i => i.cursoId === cursoId).length;
    }
    create(data) {
        if (this.find(data.estudianteId, data.cursoId))
            throw new Error('Inscripción duplicada');
        const nueva = Object.assign({ fecha: new Date().toISOString(), estado: 'activa' }, data);
        return super.add(nueva);
    }
    cancel(id) {
        return this.update(id, { estado: 'cancelada' });
    }
}
