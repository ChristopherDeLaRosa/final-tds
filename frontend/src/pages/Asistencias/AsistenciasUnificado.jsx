import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { 
  History,
  BarChart3,
  ListChecks,
  ArrowLeft
} from 'lucide-react';
import { theme } from '../../styles';
import Button from '../../components/atoms/Button/Button';

// Importar los componentes de cada módulo
import PaseLista from './tabs/PaseLista';
import HistorialAsistencias from './tabs/HistorialAsistencias';
import ReportesAsistencia from './tabs/ReportesAsistencia';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: ${props => props.$size === 'large' ? '48px' : '32px'};
  height: ${props => props.$size === 'large' ? '48px' : '32px'};
  border: 3px solid ${theme.colors.border};
  border-top: 3px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const Container = styled.div`
  padding: ${theme.spacing.xl};
  max-width: 1600px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${theme.colors.text};
  margin: 0 0 ${theme.spacing.xs} 0;
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: ${theme.colors.textMuted};
  margin: 0;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.xl};
  border-bottom: 2px solid ${theme.colors.border};
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.colors.backgroundAlt};
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: 2px;
  }
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${props => props.$active ? theme.colors.backgroundAlt : 'transparent'};
  border: none;
  border-bottom: 3px solid ${props => props.$active ? theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? theme.colors.primary : theme.colors.textMuted};
  font-weight: ${props => props.$active ? '600' : '500'};
  font-size: ${theme.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: -2px;
  white-space: nowrap;
  position: relative;

  &:hover {
    color: ${theme.colors.primary};
    background: ${theme.colors.backgroundAlt};
  }

  svg {
    flex-shrink: 0;
  }
`;

const TabContent = styled.div`
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: ${theme.spacing.lg};
  
  p {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.fontSize.md};
  }
`;

export default function AsistenciasUnificado() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('paseLista'); // paseLista | historial | reportes
  const [loading, setLoading] = useState(false);

  const tabs = [
    {
      id: 'paseLista',
      label: 'Pase de Lista',
      icon: <ListChecks size={20} />,
      component: PaseLista,
      description: 'Registra asistencia de forma grupal por sesión'
    },
    {
      id: 'historial',
      label: 'Historial',
      icon: <History size={20} />,
      component: HistorialAsistencias,
      description: 'Consulta y filtra el historial completo de asistencias'
    },
    {
      id: 'reportes',
      label: 'Reportes y Estadísticas',
      icon: <BarChart3 size={20} />,
      component: ReportesAsistencia,
      description: 'Genera reportes detallados por estudiante o grupo'
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <Container>
      <Header>
        <HeaderTop>
          <HeaderContent>
            <Title>Gestión de Asistencias</Title>
            <Subtitle>
              {activeTabData?.description || 'Control integral de asistencia estudiantil'}
            </Subtitle>
          </HeaderContent>
        </HeaderTop>
      </Header>

      <TabsContainer>
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </Tab>
        ))}
      </TabsContainer>

      <TabContent>
        {loading ? (
          <LoadingContainer>
            <LoadingSpinner $size="large" />
            <p>Cargando módulo...</p>
          </LoadingContainer>
        ) : (
          ActiveComponent && <ActiveComponent />
        )}
      </TabContent>
    </Container>
  );
}
