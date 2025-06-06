
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
    '/productos': 'Gestión de Productos',
    '/movimientos': 'Movimientos',
    '/reportes': 'Reportes',
    '/gestion': 'Gestión',  

  };

  const pageTitle = routeTitles[location.pathname] || ''; // si no está en el mapa, no muestra nada

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
