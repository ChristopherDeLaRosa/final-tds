import styled from 'styled-components';
import { ArrowLeft } from 'lucide-react';
import { theme } from '../../../styles/theme';
import Button from '../../atoms/Button/Button';

const HeaderWrapper = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.sm};
`;

const BackButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: ${theme.fontSize['2xl']};
  font-weight: 700;
  color: ${theme.colors.text};
  margin: 0;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textMuted};
  margin: ${theme.spacing.xs} 0 0 0;
  line-height: 1.4;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  align-items: center;
`;

export default function PageHeader({ 
  title, 
  subtitle, 
  showBackButton = false, 
  onBack,
  actions,
  children 
}) {
  return (
    <HeaderWrapper>
      <HeaderTop>
        {showBackButton && (
          <BackButton 
            variant="outline" 
            onClick={onBack}
            aria-label="Volver"
          >
            <ArrowLeft size={18} />
            Volver
          </BackButton>
        )}
        
        <HeaderContent>
          <Title>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </HeaderContent>

        {actions && <HeaderActions>{actions}</HeaderActions>}
      </HeaderTop>
      
      {children}
    </HeaderWrapper>
  );
}
