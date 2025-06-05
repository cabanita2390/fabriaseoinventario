import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../assets/logo-fabriaseo.png';
import {
  Container,
  Card,
  Logo,
  Title,
  Form,
  Input,
  Button,
  Error
} from '../styles/Login.css'; // ✅ Importamos los estilos separados

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (email === 'admin@fabriaseo.com' && password === '123456') {
      navigate('/dashboard');
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <Container>
      <Card>
        <Logo src={logo} alt="Logo FabriAseo" />
        <Title>Iniciar Sesión</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Error>{error}</Error>}
          <Button type="submit">Entrar</Button>
        </Form>
      </Card>
    </Container>
  );
};

export default LoginPage;
