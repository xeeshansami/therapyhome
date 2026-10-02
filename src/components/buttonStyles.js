import styled from 'styled-components';
import { Button } from '@mui/material';

// Enterprise palette (UI only). Export names are kept identical so every
// existing import/usage across the app continues to work unchanged.
// Primary actions follow the live accent (--color-primary) so every screen
// tracks the theme; destructive/semantic colours stay fixed.

export const RedButton = styled(Button)`
  && {
    background-color: #EF4444;
    color: white;
    margin-left: 4px;
    box-shadow: none;
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
    background-color: var(--color-primary, #3DBE72);
    color: #fff;
    box-shadow: none;
    &:hover {
      background-color: var(--color-primary-dark, #2E9D5B);
    }
  }
`;

export const PurpleButton = styled(Button)`
  && {
    background-color: var(--color-primary, #3DBE72);
    color: #fff;
    &:hover {
      background-color: var(--color-primary-dark, #2E9D5B);
    }
  }
`;

export const LightPurpleButton = styled(Button)`
  && {
    background-color: var(--color-primary, #3DBE72);
    color: #fff;
    width: 200px; // Set the desired width here
    box-shadow: none;
    &:hover {
      background-color: var(--color-primary-dark, #2E9D5B);
    }
  }
`;

export const LightPurpleButtonCricle = styled(Button)`
  && {
    background-color: var(--color-primary, #3DBE72);
    color: #fff;
    width: 100px;  // Set width and height to the same value for a circle
    height: 100px; // Set height to be equal to width
    border-radius: 50%; // Makes the button circular
    display: flex; // Allows flexbox alignment
    align-items: center; // Center text vertically
    justify-content: center; // Center text horizontally
    text-align: center; // Center text alignment
    box-shadow: none;

    &:hover {
      background-color: var(--color-primary-dark, #2E9D5B);
    }
  }
`;

export const GreenButton = styled(Button)`
  && {
    background-color: var(--color-primary, #3DBE72);
    color: #fff;
    box-shadow: none;
    &:hover {
      background-color: var(--color-primary-dark, #2E9D5B);
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
    background-color: var(--color-primary, #3DBE72);
    color: white;
    box-shadow: none;
    &:hover {
      background-color: var(--color-primary-dark, #2E9D5B);
      border-color: var(--color-primary-dark, #2E9D5B);
    }
  }
`;
