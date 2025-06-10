import React, { useState } from 'react';
import {
  FaBars,
  FaHome,
  FaBoxOpen,
  FaExchangeAlt,
  FaChartBar,
  FaCog,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
} from 'react-icons/fa';
import {
  SidebarContainer,
  NavSection,
  NavItem,
  CollapseButton,
  HamburgerButton,
  LogoutSection,
  LogoSection,
} from '../../styles/Sidebar.css';
import { NavLink, useNavigate } from 'react-router-dom'; // añadimos useNavigate
import logoFabriAseo from '../../assets/logo-fabriaseo.png'; // logo

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate(); // para redirigir al login

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  //  función para cerrar sesión
  const handleLogout = () => {
    // Borrar datos del usuario
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // También puedes usar localStorage.clear() si quieres borrar todo

    // Redirigir al login
    navigate('/login');
  };

  return (
    <>
      <HamburgerButton onClick={toggleMobileMenu}>
        <FaBars />
      </HamburgerButton>

      <SidebarContainer isCollapsed={isCollapsed} isMobileMenuOpen={isMobileMenuOpen}>
        {/* Sección del logo */}
        <LogoSection>
          {!isCollapsed ? (
            <img src={logoFabriAseo} alt="FabriAseo Logo" />
          ) : (
            <FaCog size={24} />
          )}
        </LogoSection>

        {/* Navegación */}
        <NavSection>
          <NavItem as={NavLink} to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FaHome />
            {!isCollapsed && <span>Dashboard</span>}
          </NavItem>
          <NavItem as={NavLink} to="/productos" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FaBoxOpen />
            {!isCollapsed && <span>Productos</span>}
          </NavItem>
          <NavItem as={NavLink} to="/Inventario" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FaBoxOpen />
            {!isCollapsed && <span>Inventario</span>}
          </NavItem>
          <NavItem as={NavLink} to="/movimientos" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FaExchangeAlt />
            {!isCollapsed && <span>Movimientos</span>}
          </NavItem>
          <NavItem as={NavLink} to="/reportes" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FaChartBar />
            {!isCollapsed && <span>Reportes</span>}
          </NavItem>
          <NavItem as={NavLink} to="/gestion" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FaCog />
            {!isCollapsed && <span>Gestión</span>}
          </NavItem>
        </NavSection>

        {/* Cerrar sesión y colapsar */}
        <LogoutSection>
          <div
            onClick={handleLogout} // redirige y limpia localStorage
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
          >
            <FaSignOutAlt />
            {!isCollapsed && <span>Cerrar sesión</span>}
          </div>

          <CollapseButton onClick={toggleCollapse}>
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </CollapseButton>
        </LogoutSection>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
