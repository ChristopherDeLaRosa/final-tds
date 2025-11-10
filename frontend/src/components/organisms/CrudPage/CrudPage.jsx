import styled from 'styled-components';
import { Plus } from 'lucide-react';
import { theme } from '../../../styles';
import { DataTable } from '../../';
import Modal from '../../molecules/Modal/Modal';
import CrudStats from './CrudStats';
import CrudForm from './CrudForm';

const PageContainer = styled.div`
  padding: ${theme.spacing.xl};
  background: ${theme.colors.bg};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
  gap: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.xxl};
  font-weight: 600;
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const Subtitle = styled.p`
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSize.sm};
  margin: 0;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.accent};
  color: ${theme.colors.text};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  transition: ${theme.transition};
  box-shadow: 0 2px 8px rgba(79, 140, 255, 0.3);
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.accentHover};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 140, 255, 0.4);
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
`;

const TableCard = styled.div`
  background: ${theme.colors.bgDark};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border};
  overflow: hidden;
  box-shadow: ${theme.shadows.lg};
`;

const LoadingOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xxl};
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSize.lg};
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-left: 4px solid #ef4444;
  color: #ef4444;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  
  &::before {
    content: '⚠';
    font-size: 24px;
  }
`;

const ModalButton = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  transition: ${theme.transition};
  border: none;
  
  ${props => props.$variant === 'primary' && `
    background: ${theme.colors.accent};
    color: ${theme.colors.text};
    
    &:hover {
      background: ${theme.colors.accentHover};
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(79, 140, 255, 0.4);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  `}
  
  ${props => props.$variant === 'secondary' && `
    background: transparent;
    color: ${theme.colors.textMuted};
    border: 1px solid ${theme.colors.border};
    
    &:hover {
      background: ${theme.colors.bgHover};
      color: ${theme.colors.text};
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `}
  
  &:active {
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
}) {
  if (loading) {
    return (
      <PageContainer>
        <LoadingOverlay>
          <div>{loadingMessage}</div>
        </LoadingOverlay>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Error Message */}
      {error && (
        <ErrorMessage>
          <div>
            <strong>Error:</strong> {error}
            {onRetry && (
              <div style={{ marginTop: '8px' }}>
                <button 
                  onClick={onRetry}
                  style={{
                    background: 'transparent',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Reintentar
                </button>
              </div>
            )}
          </div>
        </ErrorMessage>
      )}

      {/* Header */}
      <Header>
        <HeaderContent>
          <Title>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </HeaderContent>
        
        {onAdd && (
          <AddButton onClick={onAdd} disabled={loading}>
            <Plus size={20} />
            {addButtonText}
          </AddButton>
        )}
      </Header>

      {/* Stats */}
      {stats && stats.length > 0 && <CrudStats stats={stats} />}

      {/* Table */}
      <TableCard>
        <DataTable
          data={data}
          columns={columns}
          searchFields={searchFields}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions={true}
          emptyMessage={emptyMessage}
          loadingMessage={loadingMessage}
        />
      </TableCard>

      {/* Modal */}
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