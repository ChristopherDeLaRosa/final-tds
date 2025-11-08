// src/styles/SweetAlertStyles.jsx
import { createGlobalStyle } from 'styled-components';
import { theme } from './index'; 

const SweetAlertStyles = createGlobalStyle`
  /* Popup base */
  .swal2-popup {
    background: ${theme.colors.bgDark} !important;
    color: ${theme.colors.text} !important;
    border: 1px solid ${theme.colors.border} !important;
    border-radius: ${theme.borderRadius.lg} !important;
    box-shadow: ${theme.shadows.lg} !important;
  }

  .swal2-title {
    color: ${theme.colors.text} !important;
    font-size: ${theme.fontSize.lg} !important;
    font-weight: 700 !important;
  }

  .swal2-html-container {
    color: ${theme.colors.textMuted} !important;
    font-size: ${theme.fontSize.sm} !important;
  }

  /* Botones */
  .swal2-styled.swal2-confirm {
    background: ${theme.colors.accent} !important;
    color: ${theme.colors.text} !important;
    border-radius: ${theme.borderRadius.md} !important;
    box-shadow: ${theme.shadow} !important;
  }
  .swal2-styled.swal2-confirm:hover {
    background: ${theme.colors.accentHover} !important;
    transform: translateY(-1px);
  }

  .swal2-styled.swal2-cancel {
    background: transparent !important;
    color: ${theme.colors.textMuted} !important;
    border: 1px solid ${theme.colors.border} !important;
    border-radius: ${theme.borderRadius.md} !important;
  }
  .swal2-styled.swal2-cancel:hover {
    background: ${theme.colors.bgHover} !important;
    color: ${theme.colors.text} !important;
  }

  /* Loader (spinner) */
  .swal2-loader {
    border-color: ${theme.colors.accent} transparent ${theme.colors.accent} transparent !important;
  }

  /* Toast */
  .swal2-container.swal2-top-end > .swal2-toast {
    background: ${theme.colors.bgDark} !important;
    color: ${theme.colors.text} !important;
    border: 1px solid ${theme.colors.border} !important;
    box-shadow: ${theme.shadows.md} !important;
  }

  /* Inputs */
  .swal2-input, .swal2-textarea, .swal2-select, .swal2-file {
    background: ${theme.colors.bg} !important;
    color: ${theme.colors.text} !important;
    border: 1px solid ${theme.colors.border} !important;
    border-radius: ${theme.borderRadius.md} !important;
  }
  .swal2-input:focus, .swal2-textarea:focus, .swal2-select:focus {
    outline: none !important;
    border-color: ${theme.colors.accent} !important;
    box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.15) !important;
  }

  /* Iconos */
  .swal2-icon.swal2-success {
    border-color: ${theme.colors.success} !important;
    color: ${theme.colors.success} !important;
  }
  .swal2-icon.swal2-error {
    border-color: ${theme.colors.danger} !important;
    color: ${theme.colors.danger} !important;
  }
  .swal2-icon.swal2-warning {
    border-color: ${theme.colors.warning} !important;
    color: ${theme.colors.warning} !important;
  }
  .swal2-icon.swal2-info {
    border-color: ${theme.colors.info} !important;
    color: ${theme.colors.info} !important;
  }
`;

export default SweetAlertStyles;
