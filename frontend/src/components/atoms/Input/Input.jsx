
import { Search } from 'lucide-react';
import { InputWrapper, StyledInput, IconWrapper } from './Input.styles';

const Input = ({ type = 'text', ...props }) => {
  return (
    <InputWrapper>
      <IconWrapper>
        <Search size={16} />
      </IconWrapper>
      <StyledInput type={type} {...props} />
    </InputWrapper>
  );
};

export default Input;
