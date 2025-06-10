import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WelcomePage from '../pages/WelcomePage';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/dashboart/DashboardPage';
import ProductosPage from '../pages/ProductosPage';
import ManagementPage from '../pages/ManagementPage';
import BodegasPage from '../pages/BodegasPage';
import UnidadesPage from '../pages/UnidadesPage';
import PresentacionPage from '../pages/PresentacionPage';
import UsuariosPage from '../pages/UsuariosPage';
import ProveedoresPage from '../pages/ProveedoresPage';
import MovimientosPage from '../pages/Movimientos/MovimientosPage';
import Reportespage from '../pages/Reportes/Reportespage';
import InventarioPage from '../pages/Inventario/InventarioPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/productos" element={<ProductosPage />} />
      <Route path="/Inventario" element={<InventarioPage />} />
      <Route path="/movimientos" element={< MovimientosPage/>} />
      <Route path='/reportes' element={< Reportespage/>} />
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