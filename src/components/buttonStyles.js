import styled from 'styled-components';
import { Button } from '@mui/material';

// EduMin palette (UI only). Export names kept identical so all
// existing imports/usages continue to work unchanged.

export const RedButton = styled(Button)`
  && {
    background-color: #f5365c;
    color: white;
    margin-left: 4px;
    &:hover {
      background-color: #e21b45;
      border-color: #e21b45;
      box-shadow: none;
    }
  }
`;

export const BlackButton = styled(Button)`
  && {
    background-color: #2f3349;
    color: white;
    margin-left: 4px;
    &:hover {
      background-color: #1f2335;
      border-color: #1f2335;
      box-shadow: none;
    }
  }
`;

export const DarkRedButton = styled(Button)`
  && {
    background-color: #c81e3a;
    color: white;
    &:hover {
      background-color: #a9152e;
      border-color: #a9152e;
      box-shadow: none;
    }
  }
`;

export const BlueButton = styled(Button)`
  && {
    background-color: #2f6fed;
    color: #fff;
    &:hover {
      background-color: #1f57c9;
    }
  }
`;

export const PurpleButton = styled(Button)`
  && {
    background-color: #7b2ff7;
    color: #fff;
    &:hover {
      background-color: #6420d6;
    }
  }
`;

export const LightPurpleButton = styled(Button)`
  && {
    background-color: #4d44e0;
    color: #fff;
    width: 200px; // Set the desired width here
    &:hover {
      background-color: #3a32b5;
    }
  }
`;

export const LightPurpleButtonCricle = styled(Button)`
  && {
    background-color: #4d44e0;
    color: #fff;
    width: 100px;  // Set width and height to the same value for a circle
    height: 100px; // Set height to be equal to width
    border-radius: 50%; // Makes the button circular
    display: flex; // Allows flexbox alignment
    align-items: center; // Center text vertically
    justify-content: center; // Center text horizontally
    text-align: center; // Center text alignment
    box-shadow: 0 8px 20px rgba(77, 68, 224, 0.35);

    &:hover {
      background-color: #3a32b5;
    }
  }
`;

export const GreenButton = styled(Button)`
  && {
    background-color: #16a34a;
    color: #fff;
    &:hover {
      background-color: #128a3e;
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
      box-shadow: none;
    }
  }
`;

export const IndigoButton = styled(Button)`
  && {
    background-color: #4d44e0;
    color: white;
    &:hover {
      background-color: #3a32b5;
      border-color: #3a32b5;
      box-shadow: none;
    }
  }
`;
