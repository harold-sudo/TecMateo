"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InscripcionService = void 0;
const base_service_1 = require("./base.service");
const KEY = 'inscripciones';
class InscripcionService extends base_service_1.BaseService {
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
exports.InscripcionService = InscripcionService;
