export interface FieldConfig {
  tipo: 'date' | 'text' | 'select';
  id: string;
  label: string;
  options?: string[]; // Solo aplica si tipo === 'select'
}