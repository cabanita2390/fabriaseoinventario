import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WelcomePage from '../pages/WelcomePage';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import ProductosPage from '../pages/ProductosPage';
import ManagementPage from '../pages/ManagementPage';
import BodegasPage from '../pages/BodegasPage';
import UnidadesPage from '../pages/UnidadesPage';
import PresentacionPage from '../pages/PresentacionPage';
import UsuariosPage from '../pages/UsuariosPage';
import ProveedoresPage from '../pages/ProveedoresPage';
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/productos" element={<ProductosPage />} />
      <Route path="/gestion" element={<ManagementPage />} />
      <Route path="/gestion/bodegas" element={<BodegasPage />} />
      <Route path="/gestion/unidades" element={<UnidadesPage />} />
      <Route path="/gestion/presentacion" element={<PresentacionPage />} />
      <Route path="/gestion/usuarios" element={<UsuariosPage />} />
      <Route path="/gestion/proveedores" element={<ProveedoresPage />} />
    </Routes>
  );
};

export default AppRoutes;
