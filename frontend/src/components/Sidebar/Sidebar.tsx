import React, { useState, useEffect } from 'react';
import { 
  FaHome, 
  FaBoxOpen, 
  FaExchangeAlt, 
  FaChartBar, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { 
  SidebarContainer, 
  NavSection, 
  NavItem, 
  LogoSection, 
  LogoutButton,
  HamburgerButton,
  CloseButton,
  Overlay
} from '../../styles/Sidebar.css';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import logoFabriAseo from '../../assets/logo-fabriaseo.png';
import { Tooltip } from '../Sidebar/Tooltip';

interface MenuItem {
  to: string;
  icon: React.ReactNode;
  text: string;
}

interface SidebarProps {
  children?: never;
}

const Sidebar: React.FC<SidebarProps> = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/dashboard';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Controla el estado expandido/colapsado del sidebar
  const isExpanded = isDashboard || isHovered || isMobileOpen;

  useEffect(() => {
    // Actualiza las clases del body y del contenido principal
    if (isMobileOpen) {
      document.body.classList.add('no-scroll');
      document.body.classList.add('sidebar-expanded');
      document.body.classList.remove('sidebar-collapsed');
    } else {
      document.body.classList.remove('no-scroll');
      
      if (isDashboard || isHovered) {
        document.body.classList.add('sidebar-expanded');
        document.body.classList.remove('sidebar-collapsed');
      } else {
        document.body.classList.add('sidebar-collapsed');
        document.body.classList.remove('sidebar-expanded');
      }
    }

    // Para desktop: actualiza las clases cuando cambia el hover
    if (!isMobileOpen) {
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        if (isDashboard || isHovered) {
          mainContent.classList.add('sidebar-expanded');
          mainContent.classList.remove('sidebar-collapsed');
        } else {
          mainContent.classList.add('sidebar-collapsed');
          mainContent.classList.remove('sidebar-expanded');
        }
      }
    }
  }, [isDashboard, isHovered, isMobileOpen]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const menuItems: MenuItem[] = [
    { to: "/dashboard", icon: <FaHome />, text: "Dashboard" },
    { to: "/insumos", icon: <FaBoxOpen />, text: "Insumos" },
    { to: "/inventario", icon: <FaBoxOpen />, text: "Inventario" },
    { to: "/movimientos", icon: <FaExchangeAlt />, text: "Movimientos" },
    { to: "/reportes", icon: <FaChartBar />, text: "Reportes" },
    { to: "/gestion", icon: <FaCog />, text: "Gestión" },
  ];

  return (
    <>
      <HamburgerButton onClick={() => setIsMobileOpen(true)}>
        <FaBars size={20} />
      </HamburgerButton>

      <Overlay $isVisible={isMobileOpen} onClick={() => setIsMobileOpen(false)} />

      <SidebarContainer 
        $isExpanded={isExpanded}
        $isMobileOpen={isMobileOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CloseButton onClick={() => setIsMobileOpen(false)}>
          <FaTimes size={20} />
        </CloseButton>

        <LogoSection>
          <Link to="/dashboard">
            {isExpanded ? (
              <img src={logoFabriAseo} alt="FabriAseo Logo" className="logo-expanded" />
            ) : (
              <img src={logoFabriAseo} alt="FabriAseo" className="logo-collapsed" />
            )}
          </Link>
        </LogoSection>

        <NavSection>
          {menuItems.map((item) => (
            <Tooltip key={item.to} content={item.text} disabled={isExpanded} position="right">
              <NavItem 
                to={item.to}
                $isExpanded={isExpanded}
              >
                {item.icon}
                {isExpanded && <span>{item.text}</span>}
              </NavItem>
            </Tooltip>
          ))}
        </NavSection>

        <Tooltip content="Cerrar sesión" disabled={isExpanded} position="right">
          <LogoutButton 
            onClick={handleLogout}
            $isExpanded={isExpanded}
          >
            <FaSignOutAlt />
            {isExpanded && <span>Cerrar sesión</span>}
          </LogoutButton>
        </Tooltip>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;