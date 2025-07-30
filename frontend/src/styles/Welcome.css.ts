import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
  justify-content: center;
  align-items: center;
  padding: 1rem;
`;

export const Card = styled.div`
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

export const Logo = styled.img`
  width: 150px;
  height: auto;
  margin-bottom: 1.5rem;

  @media (max-width: 480px) {
    width: 120px;
  }
`;

export const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

export const Subtitle = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

export const Button = styled.button`
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

  @media (max-width: 480px) {
    font-size: 0.95rem;
    padding: 0.7rem 1.5rem;
  }
`;
