import React from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] } },
};

/** Wrap a group of fields/cards in this, then wrap each child in <StaggerItem>
 *  — children will animate in one after another instead of all at once. */
export const StaggerContainer = ({ children, sx = {}, ...props }) => (
  <Box
    component={motion.div}
    variants={containerVariants}
    initial="hidden"
    animate="show"
    sx={sx}
    {...props}
  >
    {children}
  </Box>
);

export const StaggerItem = ({ children, sx = {}, ...props }) => (
  <Box component={motion.div} variants={itemVariants} sx={sx} {...props}>
    {children}
  </Box>
);
