import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo-fabriaseo.png';

const WelcomePage = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <Container>
      <Card>
        <Logo src={logo} alt="Logo FabriAseo" />
        <Title>¡Bienvenido!</Title>
        <Subtitle>Inicia sesión para revisar tus pedidos.</Subtitle>
        <Button onClick={goToLogin}>Iniciar sesión</Button>
      </Card>
    </Container>
  );
};

export default WelcomePage;

// Estilos
const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
  justify-content: center;
  align-items: center;
  padding: 1rem;
`;

const Card = styled.div`
  background-color: white;
  padding: 3rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 480px;

  @media (max-width: 480px) {
    padding: 2rem 1.5rem;
  }
`;

const Logo = styled.img`
  width: 150px;
  height: auto;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 8px;
  background-color: #2196F3;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1b293d;
  }
`;
