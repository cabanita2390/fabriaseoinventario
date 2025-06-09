// src/components/ManagementCard/ManagementCard.tsx
import React from 'react';
import {
  SectionCard,
  SectionInfo,
  SectionTitle,
  SectionDescription,
  RegisterButton,
} from '../../styles/Management/ManagementPage.css';

interface ManagementCardProps {
  title: string;
  description: string;
  onRegister?: () => void;
}

const ManagementCard: React.FC<ManagementCardProps> = ({ title, description, onRegister }) => {
  return (
    <SectionCard>
      <SectionInfo>
        <SectionTitle>{title}</SectionTitle>
        <SectionDescription>{description}</SectionDescription>
      </SectionInfo>
      <RegisterButton onClick={onRegister}>Registrar</RegisterButton>
    </SectionCard>
  );
};

export default ManagementCard;
