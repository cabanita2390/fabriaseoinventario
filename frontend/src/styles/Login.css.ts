import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
  background-color: #f0f4f8;
  padding: 1rem;
`;

export const Card = styled.div`
  background-color: #fff;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;

  @media (max-width: 480px) {
    padding: 2rem 1.5rem;
  }
`;

export const Logo = styled.img`
  width: 120px;
  margin-bottom: 1.5rem;

  @media (max-width: 480px) {
    width: 100px;
  }
`;

export const Title = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

export const Input = styled.input`
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

export const Button = styled.button`
  padding: 0.75rem;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: #1B293D;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

export const Error = styled.p`
  color: red;
  margin-bottom: 1rem;
  font-size: 0.9rem;

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;
