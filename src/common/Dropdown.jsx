import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

const Dropdown = ({ label, options, register, name, error, helperText, value, onChange, ...props }) => {
  return (
    <FormControl fullWidth variant="outlined" error={!!error}>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={onChange}
        {...(register && name ? register(name) : {})}
        {...props}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
      {(helperText || error) && (
        <FormHelperText>{helperText || error?.message}</FormHelperText>
      )}
    </FormControl>
  );
};

export default Dropdown;
