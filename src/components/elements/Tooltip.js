import React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

const HoverTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} placement="top" classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-footer-window'),
    color: getComputedStyle(document.documentElement).getPropertyValue('--color-text'),
    fontSize: '1rem',
    padding: '8px',
    backdropFilter: 'blur(6px)',
    borderRadius: '10px',
    marginBottom: "4px !important",
  },
  
}));

export default HoverTooltip;
