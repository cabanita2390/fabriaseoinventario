
import React from 'react';
import Sidebar from './Sidebar/Sidebar';
import { useLocation } from 'react-router-dom';

interface HomeProps {
  children?: React.ReactNode;
}

function Home({ children }: HomeProps) {
  const location = useLocation();

  const routeTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/insumos': 'Gestión de Insumos',
    '/movimientos': 'Movimientos',
    '/reportes': 'Reportes',
    '/gestion': 'Gestión',
    '/gestion/productos': 'Gestión de Productos',
    '/gestion/bodegas': 'Gestión de Bodegas',
    '/gestion/unidades': 'Gestión de Unidades de Medida',
    '/gestion/presentacion': 'Gestión de Presentación',
    '/gestion/usuarios': 'Gestión de Usuarios',
    '/gestion/proveedores': 'Gestión de Proveedores',
    '/Inventario': 'Inventario'
  };

  const pageTitle = routeTitles[location.pathname] || ''; 

  return (
    <div className="container">
      <Sidebar />
      <div className="main">
        {pageTitle && <h1>{pageTitle}</h1>}
        {children}
      </div>
    </div>
  );
}

export default Home;
