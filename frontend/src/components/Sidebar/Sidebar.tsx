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
  FaSignOutAlt
} from 'react-icons/fa';
import {
  SidebarContainer,
  NavSection,
  NavItem,
  CollapseButton,
  HamburgerButton,
  LogoutSection
} from '../../styles/Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <HamburgerButton onClick={toggleMobileMenu}>
        <FaBars />
      </HamburgerButton>

      <SidebarContainer isCollapsed={isCollapsed} isMobileMenuOpen={isMobileMenuOpen}>
        <NavSection>
          <NavItem>
            <FaHome />
            {!isCollapsed && <span>Dashboard</span>}
          </NavItem>
          <NavItem>
            <FaBoxOpen />
            {!isCollapsed && <span>Productos</span>}
          </NavItem>
          <NavItem>
            <FaExchangeAlt />
            {!isCollapsed && <span>Movimientos</span>}
          </NavItem>
          <NavItem>
            <FaChartBar />
            {!isCollapsed && <span>Reportes</span>}
          </NavItem>
          <NavItem>
            <FaCog />
            {!isCollapsed && <span>Gestión</span>}
          </NavItem>
        </NavSection>

        <LogoutSection>
          <NavItem>
            <FaSignOutAlt />
            {!isCollapsed && <span>Cerrar sesión</span>}
          </NavItem>

          <CollapseButton onClick={toggleCollapse}>
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </CollapseButton>
        </LogoutSection>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
