import { EstadoEstudiante } from "./types";

export interface Estudiante {
  id: number;
  nombre: string;
  correo: string;
  edad: number;
  carrera: string;
  estado: EstadoEstudiante;
}