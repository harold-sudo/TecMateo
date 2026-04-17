import { EstadoInscripcion } from "./types";

export interface Inscripcion {
  id: number;
  estudianteId: number;
  cursoId: number;
  fecha: string; // ISO
  estado: EstadoInscripcion;
}