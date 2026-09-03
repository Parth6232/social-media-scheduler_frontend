import { Typography } from '@mui/material';

const Text = ({ type = 'body', children, sx = {}, ...props }) => {
  const getVariant = () => {
    switch (type) {
      case 'heading':
        return 'h1';
      case 'subheading':
        return 'h3';
      case 'title':
        return 'h6';
      case 'label':
        return 'subtitle2';
      case 'caption':
        return 'caption';
      default:
        return 'body1';
    }
  };

  return (
    <Typography variant={getVariant()} sx={sx} {...props}>
      {children}
    </Typography>
  );
};

export default Text;
