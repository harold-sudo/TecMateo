import { BaseService } from "./base.service.js";
const KEY = 'cursos';
export class CursoService extends BaseService {
    constructor() { super(KEY); }
    findBySigla(sigla) {
        return this.getAll().find(c => c.sigla === sigla);
    }
    create(data) {
        if (this.findBySigla(data.sigla))
            throw new Error('La sigla ya existe');
        return super.add(data);
    }
    update(id, changes) {
        const items = this.getAll();
        if (changes.sigla) {
            const other = items.find(i => i.sigla === changes.sigla && i.id !== id);
            if (other)
                throw new Error('La sigla ya existe');
        }
        return super.update(id, changes);
    }
    toggleEstado(id) {
        const curso = this.findById(id);
        if (!curso)
            throw new Error('Curso no encontrado');
        const nuevo = curso.estado === 'disponible' ? 'cerrado' : 'disponible';
        return this.update(id, { estado: nuevo });
    }
}
