import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background: ${theme.colors.bg};
    color: ${theme.colors.text};
    line-height: 1.6;
  }

  :focus-visible {
    outline: 2px solid ${theme.colors.accent};
    outline-offset: 2px;
  }

  @keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}

`;