import { TextField as MuiTextField } from '@mui/material';

const Textfield = ({ register, name, error, helperText, ...props }) => {
  return (
    <MuiTextField
      fullWidth
      variant="outlined"
      error={!!error}
      helperText={helperText || (error && error.message)}
      {...(register && name ? register(name) : {})}
      {...props}
    />
  );
};

export default Textfield;
