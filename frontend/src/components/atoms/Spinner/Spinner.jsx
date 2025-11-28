import styled, { keyframes } from 'styled-components';
import { theme } from '../../../styles/theme';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerWrapper = styled.div`
  display: inline-block;
  width: ${props => {
    switch(props.$size) {
      case 'small': return '20px';
      case 'large': return '48px';
      default: return '32px';
    }
  }};
  height: ${props => {
    switch(props.$size) {
      case 'small': return '20px';
      case 'large': return '48px';
      default: return '32px';
    }
  }};
`;

const SpinnerCircle = styled.div`
  width: 100%;
  height: 100%;
  border: 3px solid ${theme.colors.border};
  border-top: 3px solid ${props => props.$color || theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export default function Spinner({ size = 'medium', color }) {
  return (
    <SpinnerWrapper $size={size}>
      <SpinnerCircle $color={color} />
    </SpinnerWrapper>
  );
}