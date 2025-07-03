export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  tipo: 'select' | 'date' | 'number' | 'text'|'custom-date';
  id: string;
  label: string;
  placeholder?: string;
  min?: number;
   max?: number | string; // Permitir ambos tipos
  step?: number;
  options?: FieldOption[] | string[]; // Permitir ambos tipos de opciones
  defaultValue?: string; // Añade esta línea
  dateFormat?: string;
}