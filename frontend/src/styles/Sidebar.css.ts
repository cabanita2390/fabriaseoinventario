import styled, { css } from 'styled-components';
import { NavLink } from 'react-router-dom';

export const SidebarContainer = styled.aside<{ 
  $isExpanded: boolean;
  $isMobileOpen: boolean;
  $isTransitioning?: boolean;
}>`
  width: ${({ $isExpanded }) => ($isExpanded ? '240px' : '80px')};
  height: 100vh;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: fixed;
  left: 0;
  top: 0;
  transition: width 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
  z-index: 100;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }

  &:hover {
    width: 240px;
  }

  @media (max-width: 768px) {
    width: 240px;
    transform: ${({ $isMobileOpen }) => 
      $isMobileOpen ? 'translateX(0)' : 'translateX(-100%)'};
    opacity: ${({ $isMobileOpen }) => ($isMobileOpen ? 1 : 0)};
    pointer-events: ${({ $isMobileOpen }) => ($isMobileOpen ? 'all' : 'none')};
  }
`;

export const HamburgerButton = styled.button`
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 900;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    transform: scale(1.05);
  }

  @media (min-width: 769px) {
    display: none;
  }
`;

export const CloseButton = styled.button`
  display: none;
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255,255,255,0.1);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1100;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255,255,255,0.2);
  }

  @media (min-width: 769px) {
    display: none;
  }
`;

export const Overlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  visibility: ${({ $isVisible }) => ($isVisible ? 'visible' : 'hidden')};
  pointer-events: ${({ $isVisible }) => ($isVisible ? 'all' : 'none')};
  transition: opacity 0.3s ease, visibility 0.3s ease;

  @media (min-width: 769px) {
    display: none;
  }
`;

export const LogoSection = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  
  .logo-expanded {
    width: 100%;
    max-width: 160px;
    height: auto;
    transition: all 0.3s ease;
  }

  .logo-collapsed {
    width: 36px;
    height: 36px;
    object-fit: contain;
    transition: all 0.3s ease;
  }

  a {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
`;

export const NavSection = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

export const NavItem = styled(NavLink)<{ 
  $isExpanded: boolean;
  $isTransitioning?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  .nav-icon {
    font-size: 1.3rem;
    min-width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-text {
    font-size: 0.9rem;
    font-weight: 500;
    
    &.visible {
      opacity: 1;
      transform: translateX(0);
      transition: opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s;
    }
    
    &.hidden {
      opacity: 0;
      transform: translateX(-10px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
  }

  &.active {
    background: rgba(255, 255, 255, 0.15);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 24px;
      width: 3px;
      background: white;
      border-radius: 0 3px 3px 0;
    }
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const LogoutButton = styled.div<{ 
  $isExpanded: boolean;
  $isTransitioning?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.8);
  padding: 0.8rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  .nav-icon {
    font-size: 1.2rem;
    min-width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-text {
    font-size: 0.9rem;
    font-weight: 500;
    
    &.visible {
      opacity: 1;
      transform: translateX(0);
      transition: opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s;
    }
    
    &.hidden {
      opacity: 0;
      transform: translateX(-10px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const GlobalSidebarStyles = css`
  body.sidebar-expanded {
    .main-content {
      margin-left: 240px;
      transition: margin-left 0.3s ease;
    }
  }

  body.sidebar-collapsed {
    .main-content {
      margin-left: 80px;
      transition: margin-left 0.3s ease;
    }
  }

  body.no-scroll {
    overflow: hidden;
  }

  @media (max-width: 768px) {
    body.sidebar-expanded .main-content,
    body.sidebar-collapsed .main-content {
      margin-left: 0;
    }
  }
`;