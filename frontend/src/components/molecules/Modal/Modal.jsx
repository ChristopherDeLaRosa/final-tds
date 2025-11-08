import { useEffect } from 'react';
import styled from 'styled-components';

// ── Tokens locales (sin theme) ────────────────────────────────────────────────
const TOKENS = {
  spacing: { xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px' },
  radius: { md: '8px', lg: '12px' },
  fontSize: { base: '16px', lg: '20px' },
  colors: {
    bg: '#0B0F1A',
    bgDark: '#0F1525',
    bgHover: '#151C2F',
    border: '#24304A',
    text: '#E6EAF2',
    textMuted: '#9AA4B2',
  },
  shadow: '0 10px 30px rgba(0,0,0,0.35)',
  transition: 'all .2s ease',
};

// ── Componente ────────────────────────────────────────────────────────────────
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  // Escape
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handleEscape = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) onClose();
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      {/* usa transient prop para no pasar "size" al DOM */}
      <ModalContainer $size={size}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          {showCloseButton && (
            <CloseButton onClick={onClose} aria-label="Cerrar modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </CloseButton>
          )}
        </ModalHeader>

        <ModalBody>{children}</ModalBody>

        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContainer>
    </ModalOverlay>
  );
};

// ── Styled Components (sin theme) ────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${TOKENS.spacing.lg};
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContainer = styled.div`
  background: ${TOKENS.colors.bg};
  border: 1px solid ${TOKENS.colors.border};
  border-radius: ${TOKENS.radius.lg};
  box-shadow: ${TOKENS.shadow};
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;

  width: ${({ $size }) => {
    switch ($size) {
      case 'small': return '400px';
      case 'large': return '800px';
      case 'xlarge': return '1000px';
      case 'medium':
      default: return '600px';
    }
  }};
  max-width: 95%;

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @media (max-width: 768px) {
    width: 100%;
    max-height: 95vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${TOKENS.spacing.xl} ${TOKENS.spacing.xl};
  border-bottom: 1px solid ${TOKENS.colors.border};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: ${TOKENS.fontSize.lg};
  font-weight: 600;
  color: ${TOKENS.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${TOKENS.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${TOKENS.colors.textMuted};
  border-radius: ${TOKENS.radius.md};
  transition: ${TOKENS.transition};

  &:hover {
    background-color: ${TOKENS.colors.bgHover};
    color: ${TOKENS.colors.text};
  }
  &:active { transform: scale(0.95); }
`;

const ModalBody = styled.div`
  padding: ${TOKENS.spacing.xl};
  overflow-y: auto;
  flex: 1;
  color: ${TOKENS.colors.text};

  /* Scrollbar */
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track {
    background: ${TOKENS.colors.bgDark};
    border-radius: ${TOKENS.radius.md};
  }
  &::-webkit-scrollbar-thumb {
    background: ${TOKENS.colors.border};
    border-radius: ${TOKENS.radius.md};
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${TOKENS.colors.textMuted};
  }
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${TOKENS.spacing.md};
  padding: ${TOKENS.spacing.lg} ${TOKENS.spacing.xl};
  border-top: 1px solid ${TOKENS.colors.border};
  background-color: ${TOKENS.colors.bgDark};
  border-radius: 0 0 ${TOKENS.radius.lg} ${TOKENS.radius.lg};
`;

export default Modal;
