// src/components/Home.tsx
import React from 'react';
import Sidebar from './Sidebar/Sidebar';

interface HomeProps {
  children?: React.ReactNode;
}

function Home({ children }: HomeProps) {
  return (
    <div className="container">
      <Sidebar />
      <div className="main">
        <h1>Bienvenido</h1>
        {children}
      </div>
    </div>
  );
}

export default Home;
