import styled, { css } from 'styled-components';
import { NavLink } from 'react-router-dom';

export const SidebarContainer = styled.aside<{ 
  $isExpanded: boolean;
  $isMobileOpen: boolean;
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
  transition: all 0.3s ease;
  z-index: 100;
  overflow-y: auto;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);

  &:hover {
    width: 240px;
  }

  @media (max-width: 768px) {
    width: 240px;
    transform: ${({ $isMobileOpen }) => 
      $isMobileOpen ? 'translateX(0)' : 'translateX(-100%)'};
    transition: transform 0.3s ease;
    z-index: 1000;
    box-shadow: ${({ $isMobileOpen }) => 
      $isMobileOpen ? '4px 0 15px rgba(0, 0, 0, 0.2)' : 'none'};

    &:hover {
      width: 240px;
    }
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
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: scale(1.1);
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
  width: 30px;
  height: 30px;
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
  pointer-events: ${({ $isVisible }) => ($isVisible ? 'auto' : 'none')};
  transition: opacity 0.3s ease;

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
    transition: all 0.3s ease;
  }

  .logo-collapsed {
    width: 36px;
    height: 36px;
    object-fit: contain;
  }

  a {
    display: flex;
    justify-content: center;
    width: 100%;
  }
`;

export const NavSection = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

export const NavItem = styled(NavLink)<{ $isExpanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;

  &.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      height: 24px;
      width: 3px;
      background: white;
      border-radius: 0 3px 3px 0;
    }
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    font-size: 1.3rem;
    min-width: 24px;
  }

  span {
    opacity: ${({ $isExpanded }) => ($isExpanded ? 1 : 0)};
    transition: opacity 0.2s ease 0.1s;
    overflow: hidden;
  }
`;

export const LogoutButton = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.8);
  padding: 0.8rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    font-size: 1.2rem;
    min-width: 24px;
  }

  span {
    opacity: ${({ $isExpanded }) => ($isExpanded ? 1 : 0)};
    transition: opacity 0.2s ease 0.1s;
    overflow: hidden;
  }
`;