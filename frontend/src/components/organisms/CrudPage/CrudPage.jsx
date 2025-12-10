import styled from 'styled-components';
import { Plus } from 'lucide-react';
import { theme } from '../../../styles';
import { DataTable } from '../../';
import Modal from '../../molecules/Modal/Modal';
import CrudStats from './CrudStats';
import CrudForm from './CrudForm';

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
  background: ${theme.colors.background};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.xxl};
  gap: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  color: ${theme.colors.text};
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 ${theme.spacing.sm} 0;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSize.md};
  margin: 0;
  line-height: 1.5;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  align-items: center;
  
  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.accent};
  color: ${theme.colors.white};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.accentHover};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }

  svg {
    flex-shrink: 0;
  }
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.white};
  color: ${theme.colors.accent};
  border: 2px solid ${theme.colors.accent};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: ${theme.colors.accent}08;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }

  svg {
    flex-shrink: 0;
  }
`;

const TableCard = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid ${theme.colors.border};
  overflow: hidden;
  box-shadow: ${theme.shadows.lg};
`;

const LoadingOverlay = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xxxl} ${theme.spacing.xl};
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSize.md};
  gap: ${theme.spacing.lg};
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid ${theme.colors.borderLight};
    border-top-color: ${theme.colors.accent};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: ${theme.colors.dangerLight};
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-left: 4px solid ${theme.colors.danger};
  color: ${theme.colors.danger};
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing.xl};
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.md};
  box-shadow: ${theme.shadows.sm};
  
  &::before {
    content: '⚠';
    font-size: 20px;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const ErrorContent = styled.div`
  flex: 1;
  
  strong {
    font-weight: 600;
    display: block;
    margin-bottom: ${theme.spacing.xs};
  }
`;

const RetryButton = styled.button`
  margin-top: ${theme.spacing.sm};
  background: transparent;
  border: 1px solid ${theme.colors.danger};
  color: ${theme.colors.danger};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-size: ${theme.fontSize.sm};
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.danger};
    color: ${theme.colors.white};
  }
`;

const ModalButton = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  ${props => props.$variant === 'primary' && `
    background: ${theme.colors.accent};
    color: ${theme.colors.white};
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
    
    &:hover:not(:disabled) {
      background: ${theme.colors.accentHover};
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  `}
  
  ${props => props.$variant === 'secondary' && `
    background: ${theme.colors.white};
    color: ${theme.colors.textSecondary};
    border: 1px solid ${theme.colors.border};
    
    &:hover:not(:disabled) {
      background: ${theme.colors.backgroundAlt};
      color: ${theme.colors.text};
      border-color: ${theme.colors.borderDark};
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `}
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

export default function CrudPage({
  // Títulos y mensajes
  title,
  subtitle,
  addButtonText = 'Agregar',
  emptyMessage = 'No hay registros',
  loadingMessage = 'Cargando...',
  
  // Datos
  data = [],
  loading = false,
  error = null,
  stats = [],
  
  // Tabla
  columns = [],
  searchFields = [],
  filterOptions = {},
  
  // Modal
  isModalOpen = false,
  modalTitle,
  formFields = [],
  formData = {},
  formErrors = {},
  isSubmitting = false,
  
  // Handlers
  onAdd,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onInputChange,
  onRetry,
  customActions,
  
  // Botones adicionales
  additionalActions = [],
}) {
  if (loading) {
    return (
      <PageContainer>
        <LoadingOverlay>
          <div className="spinner" />
          <div>{loadingMessage}</div>
        </LoadingOverlay>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {error && (
        <ErrorMessage>
          <ErrorContent>
            <strong>Error</strong>
            <div>{error}</div>
            {onRetry && (
              <RetryButton onClick={onRetry}>
                Reintentar
              </RetryButton>
            )}
          </ErrorContent>
        </ErrorMessage>
      )}

      <Header>
        <HeaderContent>
          <Title>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </HeaderContent>
        
        <ActionButtons>
          {additionalActions && additionalActions.length > 0 && additionalActions.map((action, index) => (
            <SecondaryButton 
              key={index}
              onClick={action.onClick}
              disabled={loading || action.disabled}
            >
              {action.icon}
              {action.label}
            </SecondaryButton>
          ))}
          
          {onAdd && (
            <AddButton onClick={onAdd} disabled={loading}>
              <Plus size={20} />
              {addButtonText}
            </AddButton>
          )}
        </ActionButtons>
      </Header>

      {stats && stats.length > 0 && <CrudStats stats={stats} />}

      <TableCard>
        <DataTable
          data={data}
          columns={columns}
          searchFields={searchFields}
          filterOptions={filterOptions}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions={true}
          emptyMessage={emptyMessage}
          loadingMessage={loadingMessage}
          customActions={customActions}
        />
      </TableCard>

      <Modal
        isOpen={isModalOpen}
        onClose={onCancel}
        title={modalTitle}
        size="large"
        closeOnOverlayClick={!isSubmitting}
        footer={
          <>
            <ModalButton 
              $variant="secondary" 
              type="button" 
              onClick={onCancel} 
              disabled={isSubmitting}
            >
              Cancelar
            </ModalButton>
            <ModalButton 
              $variant="primary" 
              type="button" 
              onClick={onSave} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </ModalButton>
          </>
        }
      >
        <CrudForm
          fields={formFields}
          formData={formData}
          errors={formErrors}
          onChange={onInputChange}
          disabled={isSubmitting}
        />
      </Modal>
    </PageContainer>
  );
}

