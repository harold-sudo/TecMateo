import { EstadoCurso } from "./types.js";

export interface Curso {
  id: number;
  nombre: string;
  sigla: string;
  docente: string;
  cupoMaximo: number;
  estado: EstadoCurso;
}