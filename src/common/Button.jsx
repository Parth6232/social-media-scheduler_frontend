import { Button as MuiButton, CircularProgress } from '@mui/material';

const Button = ({ children, variant = 'contained', loading = false, disabled, ...props }) => {
  const isPrimary = variant === 'contained';
  
  return (
    <MuiButton
      variant={variant}
      disabled={disabled || loading}
      color={isPrimary ? 'primary' : 'inherit'}
      {...props}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : children}
    </MuiButton>
  );
};

export default Button;
