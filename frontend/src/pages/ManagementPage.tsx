import React from 'react';
import Home from '../components/Home';
import ManagementCard from '../components/ManagementCard/ManagementCard';
import { ManagementContainer } from '../styles/Management/ManagementPage.css';
import { useNavigate } from 'react-router-dom';

const sections = [
    {
    title: 'Productos',
    description: 'Gestiona los productos',
    path: '/gestion/productos',
  },
  {
    title: 'Bodegas',
    description: 'Gestiona las bodegas',
    path: '/gestion/bodegas',
  },
  {
    title: 'Unidades de Medida',
    description: 'Configura las unidades de medida',
    path: '/gestion/unidades',
  },
  {
    title: 'Presentación',
    description: 'Administra los tipos de presentación',
    path: '/gestion/presentacion',
  },
  {
    title: 'Usuarios',
    description: 'Gestión de usuarios',
    path: '/gestion/usuarios',
  },
  {
    title: 'Proveedores',
    description: 'Gestión de proveedores',
    path: '/gestion/proveedores',
  },
];

const ManagementPage = () => {
  const navigate = useNavigate();

  return (
    <Home>
      <ManagementContainer>
        {sections.map((section) => (
          <ManagementCard
            key={section.title}
            title={section.title}
            description={section.description}
            onRegister={() => navigate(section.path)}
          />
        ))}
      </ManagementContainer>
    </Home>
  );
};

export default ManagementPage;
