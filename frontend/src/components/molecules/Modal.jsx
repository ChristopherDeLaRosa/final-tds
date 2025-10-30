import { useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${theme.spacing.lg};
  animation: fadeIn 0.2s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContainer = styled.div`
  background: ${theme.colors.bgDark};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border};
  width: 100%;
  max-width: ${props => props.maxWidth || '600px'};
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${theme.shadows.xl};
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Scrollbar personalizado */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.colors.bg};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.accent};
  }
`;

const ModalHeader = styled.div`
  padding: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${theme.colors.bg};
  border-radius: ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.xl};
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.textMuted};
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.sm};
  transition: ${theme.transition};

  &:hover {
    background: ${theme.colors.bgHover};
    color: ${theme.colors.text};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ModalBody = styled.div`
  padding: ${theme.spacing.xl};
`;

const ModalFooter = styled.div`
  padding: ${theme.spacing.xl};
  border-top: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: ${props => props.align || 'flex-end'};
  gap: ${theme.spacing.md};
  background: ${theme.colors.bg};
  border-radius: 0 0 ${theme.borderRadius.lg} ${theme.borderRadius.lg};

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

/**
 * Modal Reutilizable
 * 
 * @param {boolean} isOpen - Controla si el modal está visible
 * @param {function} onClose - Función para cerrar el modal
 * @param {string} title - Título del modal
 * @param {ReactNode} children - Contenido del modal
 * @param {ReactNode} footer - Contenido del footer (botones)
 * @param {string} maxWidth - Ancho máximo del modal (default: '600px')
 * @param {string} footerAlign - Alineación del footer ('flex-start', 'center', 'flex-end')
 * @param {boolean} closeOnOverlayClick - Si se debe cerrar al hacer click fuera (default: true)
 * @param {boolean} showCloseButton - Mostrar botón de cerrar X (default: true)
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '600px',
  footerAlign = 'flex-end',
  closeOnOverlayClick = true,
  showCloseButton = true,
}) {
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer maxWidth={maxWidth}>
        {title && (
          <ModalHeader>
            <ModalTitle>{title}</ModalTitle>
            {showCloseButton && (
              <CloseButton onClick={onClose} type="button">
                &times;
              </CloseButton>
            )}
          </ModalHeader>
        )}

        <ModalBody>{children}</ModalBody>

        {footer && <ModalFooter align={footerAlign}>{footer}</ModalFooter>}
      </ModalContainer>
    </ModalOverlay>
  );
}
