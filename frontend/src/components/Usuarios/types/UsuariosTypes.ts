export type Rol = {
  id: number;
  nombre: string;
};

export type Usuario = {
  id: number;
  username: string;
  nombre: string;
  email: string;
  password?: string;
  fechaCreacion?: string;
  estado?: string;
  rol?: Rol;
};

export type CreateUsuarioDto = {
  username: string;
  nombre: string;
  email: string;
  password: string;
};

export type UpdateUsuarioDto = {
  username?: string;
  nombre?: string;
  email?: string;
  password?: string;
};

export const initialForm: Usuario = {
  id: 0,
  username: '',
  nombre: '',
  email: '',
  password: '',
  estado: 'Activo'
};