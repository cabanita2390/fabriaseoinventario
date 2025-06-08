import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WelcomePage from '../pages/WelcomePage';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/dashboart/DashboardPage';
import ProductosPage from '../pages/Productos/ProductosPage';
import MovimientosPage from '../pages/Movimientos/MovimientosPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/productos" element={<ProductosPage />} />
      <Route path="/movimientos" element={< MovimientosPage/>} />
    </Routes>
  );
};

export default AppRoutes;
