import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

export const SidebarContainer = styled.aside<{ isCollapsed: boolean; isMobileMenuOpen: boolean }>`
  width: ${({ isCollapsed }) => (isCollapsed ? '60px' : '240px')};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  height: 100vh;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: width 0.3s ease;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: ${({ isMobileMenuOpen }) => (isMobileMenuOpen ? '0' : '-100%')};
    z-index: 1000;
    transition: left 0.3s ease;
  }
`;

export const LogoSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  color: #1B293D;
  background-color: #ffffff;
  border-radius: 10px; // color de fondo del logo

  img {
    max-width: 150px;   // ajusta el ancho máximo que quieras
    height: auto;
    object-fit: contain;
  }
`;

export const NavSection = styled.nav`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1.2rem;
`;

export const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.3s;

  &.active {
    border-bottom: 2px solid white;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }

  svg {
    font-size: 1.2rem;
  }

  span {
    white-space: nowrap;
  }
`;

export const CollapseButton = styled.button`
  margin-top: 1rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  align-self: center;

  svg {
    font-size: 1.2rem;
  }
`;

export const HamburgerButton = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: block;
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.5rem;
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1100;
  }
`;

export const LogoutSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
