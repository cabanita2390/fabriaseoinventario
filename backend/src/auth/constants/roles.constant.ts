// src/auth/constants/roles.constant.ts

export type AppRole =
  | 'ADMIN'
  | 'RECEPTOR_MP'
  | 'RECEPTOR_INSUMOS'
  | 'LIDER_PRODUCCION'
  | 'OPERARIO_PRODUCCION';

export const ADMIN: AppRole = 'ADMIN';
export const RECEPTOR_MP: AppRole = 'RECEPTOR_MP';
export const RECEPTOR_INSUMOS: AppRole = 'RECEPTOR_INSUMOS';
export const LIDER_PRODUCCION: AppRole = 'LIDER_PRODUCCION';
export const OPERARIO_PRODUCCION: AppRole = 'OPERARIO_PRODUCCION';
