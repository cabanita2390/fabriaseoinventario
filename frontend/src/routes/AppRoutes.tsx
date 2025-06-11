import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WelcomePage from '../pages/WelcomePage';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/dashboart/DashboardPage';
import InsumosPage from '../pages/Insumos/InsumosPage'; 
import ManagementPage from '../pages/ManagementPage';
import ProductosBasePage from '../pages/Gestion/ProductosBasePage';
import BodegasPage from '../pages/Gestion/BodegasPage';
import UnidadesPage from '../pages/Gestion/UnidadesPage';
import PresentacionPage from '../pages/Gestion/PresentacionPage';
import UsuariosPage from '../pages/Gestion/UsuariosPage';
import ProveedoresPage from '../pages/Gestion/ProveedoresPage';
import MovimientosPage from '../pages/Movimientos/MovimientosPage';
import Reportespage from '../pages/Reportes/Reportespage';
import InventarioPage from '../pages/Inventario/InventarioPage';
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/insumos" element={<InsumosPage />} />
      <Route path="/movimientos" element={<MovimientosPage />} />
      <Route path='/reportes' element={<Reportespage />} />
      <Route path="/gestion" element={<ManagementPage />} />
      <Route path="/gestion/productos" element={<ProductosBasePage />} />
      <Route path="/gestion/bodegas" element={<BodegasPage />} />
      <Route path="/gestion/unidades" element={<UnidadesPage />} />
      <Route path="/gestion/presentacion" element={<PresentacionPage />} />
      <Route path="/gestion/usuarios" element={<UsuariosPage />} />
      <Route path="/gestion/proveedores" element={<ProveedoresPage />} />
      <Route path="/inventario" element={<InventarioPage/>}/>
    </Routes>
  );
};


export default AppRoutes;