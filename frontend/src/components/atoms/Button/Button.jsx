
import { StyledButton } from './Button.styles';

const Button = ({ children, variant = 'default', active, ...props }) => {
  return (
    <StyledButton
      {...(active ? { active: true } : {})} 
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
