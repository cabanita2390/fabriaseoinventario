import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';

const DashboardPage = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px', padding: '2rem' }}>
        <h1>Bienvenido</h1>
        <p>Aquí se mostrará todo el contenido.</p>
      </main>
    </div>
  );
};

export default DashboardPage;
