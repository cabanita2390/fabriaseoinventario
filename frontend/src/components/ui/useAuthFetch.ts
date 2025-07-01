import { useCallback } from 'react';
import Swal from 'sweetalert2';

export interface ApiError extends Error {
  response?: {
    status: number;
    data?: any;
  };
}

// Función utilitaria para usar en servicios (archivos .ts)
export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    Swal.fire('Error', 'Debes iniciar sesión', 'error');
    throw new Error('No autenticado');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 401) {
    localStorage.removeItem('authToken');
    Swal.fire('Sesión expirada', 'Por favor vuelve a iniciar sesión', 'warning');
    throw new Error('Sesión expirada');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: ApiError = new Error(errorData.message || 'Error en la solicitud');
    error.response = { status: response.status, data: errorData };
    throw error;
  }

  return response;
};

// Hook para usar en componentes React
export const useAuthFetch = () => {
  const memoizedAuthFetch = useCallback(authFetch, []);
  
  return { authFetch: memoizedAuthFetch };
};