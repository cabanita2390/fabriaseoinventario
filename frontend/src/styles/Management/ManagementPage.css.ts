import styled from 'styled-components';

export const ManagementContainer = styled.div`
  flex: 1;
  padding: 2rem;
  background-color: #f9f9f9;
`;

export const SectionCard = styled.div`
  background-color: #eaeaea;
  border-radius: 2rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const SectionInfo = styled.div``;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.3rem;
`;

export const SectionDescription = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: #555;
`;

export const RegisterButton = styled.button`
  background-color: #2196f3;
  color: white;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 0.6rem;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #1976d2;
  }
`;
