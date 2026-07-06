import styled from 'styled-components';
import { Button } from '@mui/material';

// Enterprise palette (UI only). Export names are kept identical so every
// existing import/usage across the app continues to work unchanged.
// Primary actions now use Blue #2563EB; secondary uses Indigo #4F46E5.

export const RedButton = styled(Button)`
  && {
    background-color: #EF4444;
    color: white;
    margin-left: 4px;
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.28);
    &:hover {
      background-color: #dc2626;
      border-color: #dc2626;
    }
  }
`;

export const BlackButton = styled(Button)`
  && {
    background-color: #0F172A;
    color: white;
    margin-left: 4px;
    &:hover {
      background-color: #1e293b;
      border-color: #1e293b;
    }
  }
`;

export const DarkRedButton = styled(Button)`
  && {
    background-color: #dc2626;
    color: white;
    &:hover {
      background-color: #b91c1c;
      border-color: #b91c1c;
    }
  }
`;

export const BlueButton = styled(Button)`
  && {
    background-color: #2563EB;
    color: #fff;
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.28);
    &:hover {
      background-color: #1d4ed8;
    }
  }
`;

export const PurpleButton = styled(Button)`
  && {
    background-color: #7C3AED;
    color: #fff;
    &:hover {
      background-color: #6d28d9;
    }
  }
`;

export const LightPurpleButton = styled(Button)`
  && {
    background-color: #2563EB;
    color: #fff;
    width: 200px; // Set the desired width here
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
    &:hover {
      background-color: #1d4ed8;
    }
  }
`;

export const LightPurpleButtonCricle = styled(Button)`
  && {
    background-color: #2563EB;
    color: #fff;
    width: 100px;  // Set width and height to the same value for a circle
    height: 100px; // Set height to be equal to width
    border-radius: 50%; // Makes the button circular
    display: flex; // Allows flexbox alignment
    align-items: center; // Center text vertically
    justify-content: center; // Center text horizontally
    text-align: center; // Center text alignment
    box-shadow: 0 10px 24px rgba(37, 99, 235, 0.4);

    &:hover {
      background-color: #1d4ed8;
    }
  }
`;

export const GreenButton = styled(Button)`
  && {
    background-color: #10B981;
    color: #fff;
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.26);
    &:hover {
      background-color: #059669;
    }
  }
`;

export const BrownButton = styled(Button)`
  && {
    background-color: #8d6e63;
    color: white;
    &:hover {
      background-color: #75584e;
      border-color: #75584e;
    }
  }
`;

export const IndigoButton = styled(Button)`
  && {
    background-color: #4F46E5;
    color: white;
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.28);
    &:hover {
      background-color: #4338ca;
      border-color: #4338ca;
    }
  }
`;
