import { EstadoInscripcion } from "./types.js";

export interface Inscripcion {
  id: number;
  estudianteId: number;
  cursoId: number;
  fecha: string; // ISO
  estado: EstadoInscripcion;
}