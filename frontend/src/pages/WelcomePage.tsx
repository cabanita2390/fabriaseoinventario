import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo-fabriaseo.png';
import {
  Container,
  Card,
  Logo,
  Title,
  Subtitle,
  Button,
} from '../styles/Welcome.css';

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
