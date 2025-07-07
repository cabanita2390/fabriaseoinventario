import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaHome, FaBoxOpen, FaExchangeAlt, FaChartBar, FaCog, 
  FaSignOutAlt, FaBars, FaTimes 
} from 'react-icons/fa';
import { 
  SidebarContainer, NavSection, NavItem, LogoSection, 
  LogoutButton, HamburgerButton, CloseButton, Overlay 
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login');
    }
  }, [navigate]);

  const isExpanded = isHovered || isMobileOpen;

  const handleCloseSidebar = useCallback(() => {
    setIsTransitioning(true);
    setIsMobileOpen(false);
    setIsHovered(false);
    
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!isMobileOpen) {
      setIsTransitioning(true);
      setIsHovered(true);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [isMobileOpen]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobileOpen) {
      setIsTransitioning(true);
      setIsHovered(false);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [isMobileOpen]);

  const handleMobileOpen = useCallback(() => {
    setIsTransitioning(true);
    setIsMobileOpen(true);
    setTimeout(() => setIsTransitioning(false), 300);
  }, []);

  useEffect(() => {
    handleCloseSidebar();
  }, [location.pathname, handleCloseSidebar]);

  useEffect(() => {
    return () => {
      document.body.classList.remove('no-scroll', 'sidebar-expanded', 'sidebar-collapsed');
    };
  }, []);

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
      <HamburgerButton 
        onClick={handleMobileOpen}
        aria-label="Abrir menú"
      >
        <FaBars size={20} />
      </HamburgerButton>

      <Overlay 
        $isVisible={isMobileOpen} 
        onClick={handleCloseSidebar}
        data-testid="sidebar-overlay"
      />

      <SidebarContainer 
        $isExpanded={isExpanded}
        $isMobileOpen={isMobileOpen}
        $isTransitioning={isTransitioning}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="navigation"
        aria-label="Navegación principal"
      >
        <CloseButton 
          onClick={handleCloseSidebar}
          aria-label="Cerrar menú"
        >
          <FaTimes size={20} />
        </CloseButton>

        <LogoSection>
          <Link to="/dashboard" aria-label="Ir al dashboard">
            <img 
              src={logoFabriAseo} 
              alt="FabriAseo Logo" 
              className={isExpanded ? "logo-expanded" : "logo-collapsed"}
              loading="lazy"
            />
          </Link>
        </LogoSection>

        <NavSection>
          {menuItems.map((item) => (
            <Tooltip 
              key={item.to} 
              content={item.text} 
              disabled={isExpanded || isTransitioning} 
              position="right"
            >
              <NavItem 
                to={item.to}
                $isExpanded={isExpanded}
                $isTransitioning={isTransitioning}
                aria-label={item.text}
              >
                <span className="nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className={`nav-text ${isExpanded && !isTransitioning ? 'visible' : 'hidden'}`}>
                  {item.text}
                </span>
              </NavItem>
            </Tooltip>
          ))}
        </NavSection>

        <Tooltip 
          content="Cerrar sesión" 
          disabled={isExpanded || isTransitioning} 
          position="right"
        >
          <LogoutButton 
            onClick={handleLogout}
            $isExpanded={isExpanded}
            $isTransitioning={isTransitioning}
            aria-label="Cerrar sesión"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLogout();
              }
            }}
          >
            <span className="nav-icon" aria-hidden="true">
              <FaSignOutAlt />
            </span>
            <span className={`nav-text ${isExpanded && !isTransitioning ? 'visible' : 'hidden'}`}>
              Cerrar sesión
            </span>
          </LogoutButton>
        </Tooltip>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;