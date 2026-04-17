import { EstadoEstudiante } from "./types.js";

export interface Estudiante {
  id: number;
  nombre: string;
  correo: string;
  edad: number;
  carrera: string;
  estado: EstadoEstudiante;
}