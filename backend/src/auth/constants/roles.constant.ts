// src/auth/constants/roles.constant.ts

export type AppRole =
  | 'ADMIN'
  | 'LIDER_PRODUCCION'
  | 'RECEPTOR_MP'
  | 'RECEPTOR_ENVASE'
  | 'RECEPTOR_ETIQUETAS'
  | 'OPERARIO_PRODUCCION'
  | 'USUARIO';

export const ADMIN: AppRole = 'ADMIN';
export const LIDER_PRODUCCION: AppRole = 'LIDER_PRODUCCION';
export const RECEPTOR_MP: AppRole = 'RECEPTOR_MP';
export const RECEPTOR_ENVASE: AppRole = 'RECEPTOR_ENVASE';
export const RECEPTOR_ETIQUETAS: AppRole = 'RECEPTOR_ETIQUETAS';
export const OPERARIO_PRODUCCION: AppRole = 'OPERARIO_PRODUCCION';
export const USUARIO: AppRole = 'USUARIO';
