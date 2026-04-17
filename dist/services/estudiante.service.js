import { BaseService } from "./base.service.js";
const KEY = 'estudiantes';
export class EstudianteService extends BaseService {
    constructor() { super(KEY); }
    findByEmail(email) {
        return this.getAll().find(s => s.correo === email);
    }
    create(data) {
        if (this.findByEmail(data.correo))
            throw new Error('El correo ya está en uso');
        return super.add(data);
    }
    update(id, changes) {
        const items = this.getAll();
        if (changes.correo) {
            const other = items.find(i => i.correo === changes.correo && i.id !== id);
            if (other)
                throw new Error('El correo ya está en uso');
        }
        return super.update(id, changes);
    }
    toggleEstado(id) {
        const student = this.findById(id);
        if (!student)
            throw new Error('Estudiante no encontrado');
        const nuevoEstado = student.estado === 'activo' ? 'inactivo' : 'activo';
        return this.update(id, { estado: nuevoEstado });
    }
}
