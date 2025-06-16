import { createGlobalStyle } from 'styled-components';
import { css } from 'styled-components';

export const SidebarGlobalStyles = css`
  .main-content {
    transition: margin-left 0.3s ease;
    margin-left: 80px; /* Ancho del sidebar colapsado */
  }
  
  .sidebar-expanded ~ .main-content {
    margin-left: 240px; /* Ancho del sidebar expandido */
  }
  
  @media (max-width: 768px) {
    .main-content {
      margin-left: 0;
      padding-top: 4rem; /* Espacio para el botón hamburguesa */
    }
    
    .sidebar-expanded ~ .main-content {
      margin-left: 0;
    }
  }

  body.no-scroll {
    overflow: hidden;
  }
`;

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Roboto', sans-serif;
  }

  body {
    background-color: #f5f5f5;
  }

  ${SidebarGlobalStyles}
`;

export default GlobalStyles;