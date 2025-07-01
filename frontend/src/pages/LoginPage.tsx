import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/auth'; // Ruta corregida a la carpeta api
import logo from '../assets/logo-fabriaseo.png';
import {
  Container,
  Card,
  Logo,
  Title,
  Form,
  Input,
  Button,
  Error as ErrorStyled
} from '../styles/Login.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!username || !password) {
      setError('Todos los campos son obligatorios');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        username: username.trim(),
        password
      });

      localStorage.setItem('authToken', response.data.access_token);
      navigate('/dashboard');
      
    } catch (err: any) {
      let errorMessage = 'Error al iniciar sesión';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Credenciales incorrectas';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'No se pudo conectar al servidor';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Logo src={logo} alt="Logo FabriAseo" />
        <Title>Iniciar Sesión</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && <ErrorStyled>{error}</ErrorStyled>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Entrar'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default LoginPage;