export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  tipo: 'select' | 'date' | 'number' | 'text';
  id: string;
  label: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: FieldOption[] | string[]; // Permitir ambos tipos de opciones
}