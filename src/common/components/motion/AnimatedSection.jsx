import React from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';

const AnimatedSection = ({ children, delay = 0, direction = 'up', sx = {}, ...props }) => {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
    none: { x: 0, y: 0 }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      sx={sx}
      {...props}
    >
      {children}
    </Box>
  );
};

export default AnimatedSection;
