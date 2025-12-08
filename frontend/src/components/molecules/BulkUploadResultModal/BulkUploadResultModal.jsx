import styled from 'styled-components';
import { theme } from '../../../styles';
import { CheckCircle, XCircle, Download, X } from 'lucide-react';
import * as XLSX from 'xlsx';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${theme.spacing.lg};
`;

const Modal = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  padding: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: ${theme.fontSize['2xl']};
  font-weight: 700;
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  padding: ${theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.md};
  transition: all 0.2s;

  &:hover {
    background-color: ${theme.colors.bgSecondary};
    color: ${theme.colors.textPrimary};
  }
`;

const Content = styled.div`
  padding: ${theme.spacing.xl};
  overflow-y: auto;
  flex: 1;
`;

const Summary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const SummaryCard = styled.div`
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  background: ${props => props.$bgColor};
  border: 1px solid ${props => props.$borderColor};
`;

const SummaryLabel = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.xs};
`;

const SummaryValue = styled.div`
  font-size: ${theme.fontSize['3xl']};
  font-weight: 700;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const Section = styled.div`
  margin-bottom: ${theme.spacing.xl};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: ${theme.fontSize.lg};
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const ListItem = styled.div`
  padding: ${theme.spacing.md};
  background: ${theme.colors.bgSecondary};
  border-radius: ${theme.borderRadius.md};
  border-left: 3px solid ${props => props.$borderColor};
`;

const ListItemHeader = styled.div`
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.xs};
`;

const ListItemDetail = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
`;

const ErrorDetail = styled.div`
  margin-top: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  background: rgba(239, 68, 68, 0.1);
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.error};
`;

const Footer = styled.div`
  padding: ${theme.spacing.xl};
  border-top: 1px solid ${theme.colors.border};
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.md};
  font-weight: 600;
  font-size: ${theme.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  border: none;

  ${props => props.$variant === 'primary' && `
    background-color: ${theme.colors.primary};
    color: white;

    &:hover {
      background-color: ${theme.colors.primaryHover};
    }
  `}

  ${props => props.$variant === 'secondary' && `
    background-color: ${theme.colors.bgSecondary};
    color: ${theme.colors.textPrimary};

    &:hover {
      background-color: ${theme.colors.border};
    }
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.textSecondary};
`;

export default function BulkUploadResultModal({ results, onClose }) {
  const handleDownloadErrors = () => {
    const errorsData = results.fallidos.map(error => ({
      Fila: error.fila,
      Error: error.error,
      Nombres: error.datos.nombres || '',
      Apellidos: error.datos.apellidos || '',
      Email: error.datos.email || '',
      GradoActual: error.datos.gradoActual || '',
      SeccionActual: error.datos.seccionActual || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(errorsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Errores');
    
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `errores_carga_${timestamp}.xlsx`);
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Resultados de Carga Masiva</Title>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </Header>

        <Content>
          <Summary>
            <SummaryCard 
              $bgColor="rgba(59, 130, 246, 0.1)" 
              $borderColor="rgba(59, 130, 246, 0.3)"
            >
              <SummaryLabel>Total Procesados</SummaryLabel>
              <SummaryValue $color={theme.colors.accent}>
                {results.total}
              </SummaryValue>
            </SummaryCard>

            <SummaryCard 
              $bgColor="rgba(16, 185, 129, 0.1)" 
              $borderColor="rgba(16, 185, 129, 0.3)"
            >
              <SummaryLabel>Exitosos</SummaryLabel>
              <SummaryValue $color={theme.colors.success}>
                <CheckCircle size={32} />
                {results.exitosos.length}
              </SummaryValue>
            </SummaryCard>

            <SummaryCard 
              $bgColor="rgba(239, 68, 68, 0.1)" 
              $borderColor="rgba(239, 68, 68, 0.3)"
            >
              <SummaryLabel>Fallidos</SummaryLabel>
              <SummaryValue $color={theme.colors.error}>
                <XCircle size={32} />
                {results.fallidos.length}
              </SummaryValue>
            </SummaryCard>
          </Summary>

          {results.exitosos.length > 0 && (
            <Section>
              <SectionTitle>
                <CheckCircle size={20} color={theme.colors.success} />
                Estudiantes Creados Exitosamente
              </SectionTitle>
              <List>
                {results.exitosos.map((item, index) => (
                  <ListItem key={index} $borderColor={theme.colors.success}>
                    <ListItemHeader>{item.nombre}</ListItemHeader>
                    <ListItemDetail>
                      Matrícula: {item.matricula} | Fila: {item.fila}
                    </ListItemDetail>
                  </ListItem>
                ))}
              </List>
            </Section>
          )}

          {results.fallidos.length > 0 && (
            <Section>
              <SectionTitle>
                <XCircle size={20} color={theme.colors.error} />
                Estudiantes con Errores
              </SectionTitle>
              <List>
                {results.fallidos.map((item, index) => (
                  <ListItem key={index} $borderColor={theme.colors.error}>
                    <ListItemHeader>
                      Fila {item.fila}: {item.datos.nombres} {item.datos.apellidos}
                    </ListItemHeader>
                    <ErrorDetail>{item.error}</ErrorDetail>
                  </ListItem>
                ))}
              </List>
            </Section>
          )}

          {results.exitosos.length === 0 && results.fallidos.length === 0 && (
            <EmptyState>No hay resultados para mostrar</EmptyState>
          )}
        </Content>

        <Footer>
          {results.fallidos.length > 0 && (
            <Button $variant="secondary" onClick={handleDownloadErrors}>
              <Download size={18} />
              Descargar Errores
            </Button>
          )}
          <Button $variant="primary" onClick={onClose}>
            Cerrar
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
}
