import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Box,
  Container,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import { AccountCircle, School, Group } from '@mui/icons-material';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';
import background from "../assets/background_web.png";
import logo from "../assets/logo.png"; // Assuming you have a logo image

const ChooseUser = ({ visitor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const password = "zxc";

  const { status, currentUser, currentRole } = useSelector(state => state.user);

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const navigateHandler = (user) => {
    if (user === "Admin") {
      navigate('/Adminlogin');
    } else if (user === "Student") {
      navigate('/Studentlogin');
    } else if (user === "Teacher") {
      navigate('/Teacherlogin');
    }
  };

  useEffect(() => {
    if (status === 'success' || currentUser !== null) {
      if (currentRole === 'Admin') {
        navigate('/Admin/dashboard');
      } else if (currentRole === 'Student') {
        navigate('/Student/dashboard');
      } else if (currentRole === 'Teacher') {
        navigate('/Teacher/dashboard');
      }
    } else if (status === 'error') {
      setLoader(false);
      setMessage("Network Error");
      setShowPopup(true);
    }
  }, [status, currentRole, navigate, currentUser]);

  return (
    <StyledContainerBackground>
      <StyledContainer>
        <StyledContent>
           {/* Logo at the top */}
           <StyledLogo src={logo} alt="Logo" />
           <StyledCaption>TherapyHome</StyledCaption>
          <Grid container
            spacing={2} justifyContent="center" alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <div onClick={() => navigateHandler("Admin")}>
                <StyledPaper elevation={3}>
                  <Box mb={2}>
                    <AccountCircle fontSize="large" />
                  </Box>
                  <StyledTypography>
                    Admin
                  </StyledTypography>
                  Login as an administrator to access the TherapyHome.
                </StyledPaper>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StyledPaper elevation={3}>
                <div onClick={() => navigateHandler("Teacher")}>
                  <Box mb={2}>
                    <Group fontSize="large" />
                  </Box>
                  <StyledTypography>
                    Teachers
                  </StyledTypography>
                  Login as a teacher to create courses, sessions, and track student records.
                </div>
              </StyledPaper>
            </Grid>
            {/* <Grid item xs={12} sm={6} md={4}>
              <StyledPaper elevation={3}>
                <div onClick={() => navigateHandler("Student")}>
                  <Box mb={2}>
                    <School fontSize="large" />
                  </Box>
                  <StyledTypography>
                    Receptionist
                  </StyledTypography>
                  Login as a receptionist to explore sessions, student fees & invoices
                </div>
              </StyledPaper>
            </Grid> */}
          </Grid>
        </StyledContent>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loader}
        >
          <CircularProgress color="inherit" />
          Please Wait
        </Backdrop>
        <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
      </StyledContainer>
    </StyledContainerBackground>
  );
};

export default ChooseUser;

// Logo styling
const StyledLogo = styled.img`
  width: 200px; /* Adjust size as needed */
  height: auto; /* Maintain aspect ratio */
  margin-bottom: 2rem; /* Space between logo and grid */
  display: block; /* Block display to center horizontally */
  margin-left: auto; /* Center horizontally */
  margin-right: auto; /* Center horizontally */
`;

const StyledContainer = styled.div`
  // background: linear-gradient(to bottom, #411d70, #19118b);
  height: 100vh; /* Changed to full viewport height */
  display: flex;
  justify-content: center;
  align-items: center; /* Center items vertically */
  padding: 2rem;
`;

const StyledContent = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: auto;
`;

const StyledPaper = styled.div`
  padding: 28px 22px;
  text-align: center;
  background-color: #ffffff;
  color: #2f3349;
  cursor: pointer;
  border: 1px solid #eceef5;
  border-radius: 16px;
  box-shadow: 0 10px 28px rgba(45, 55, 99, 0.10);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  flex: 1; /* Ensures that all grid items have the same size */
  min-width: 250px; /* Optional: ensures minimum width */
  height: 100%; /* Optional: ensures full height */

  & .MuiSvgIcon-root {
    color: #4d44e0;
    font-size: 2.6rem;
  }

  &:hover {
    transform: translateY(-6px);
    border-color: #4d44e0;
    box-shadow: 0 16px 36px rgba(77, 68, 224, 0.22);
  }
`;

const StyledTypography = styled.h2`
  margin-bottom: 10px;
  color: #2f3349;
`;

const StyledContainerBackground = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: "Josefin Sans", sans-serif;
  color: white;
  background-image: url(${background}); /* Use template literal to apply the imported image */
  background-size: cover; /* Optional: ensures the background image covers the entire container */
  background-position: center; /* Optional: centers the background image */
`;

// Caption styling
const StyledCaption = styled.p`
  font-size: 2.2rem; /* Adjust font size as needed */
  color: white; /* Caption text color */
  margin: 0; /* Remove default margins */
  text-align: center; /* Center text */
  margin-bottom: 2rem; /* Space between caption and grid */
`;
// export default StyledContainerBackground;