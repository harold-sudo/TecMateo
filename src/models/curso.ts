import { EstadoCurso } from "./types";

export interface Curso {
  id: number;
  nombre: string;
  sigla: string;
  docente: string;
  cupoMaximo: number;
  estado: EstadoCurso;
}