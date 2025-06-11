import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Box, Typography, Paper, Checkbox, FormControlLabel, TextField, CssBaseline, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import bgpic from "../../assets/designlogin.jpg"
import { LightPurpleButton } from '../../components/buttonStyles';
import { registerUser } from '../../redux/userRelated/userHandle';
import styled from 'styled-components';
import Popup from '../../components/Popup';
import logo from "../../assets/logo.png";
import background from "../../assets/background_web.png";
const defaultTheme = createTheme();

const AdminRegisterPage = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { status, currentUser, response, error, currentRole } = useSelector(state => state.user);;

    const [toggle, setToggle] = useState(false)
    const [loader, setLoader] = useState(false)
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [adminNameError, setAdminNameError] = useState(false);
    const [adminKeyError, setAdminKeyError] = useState(false);
    const [schoolNameError, setSchoolNameError] = useState(false);
    const role = "Admin"

    const handleSubmit = (event) => {
        event.preventDefault();
    
        console.log("event", event.target);
        const name = event.target.adminName.value;
        const key = event.target.adminKey.value;
        const schoolName = event.target.schoolName.value;
        const email = event.target.email.value;
        const password = event.target.password.value;

        if (!name || !key || !schoolName || !email || !password) {
            if (!name) setAdminNameError(true);
            if (!key) setAdminKeyError(true);
            if (!schoolName) setSchoolNameError(true);
            if (!email) setEmailError(true);
            if (!password) setPasswordError(true);
            return;
        }
        if (key == "1234") {
            const fields = { name, key, email, password, role, schoolName }
            setLoader(true)
            dispatch(registerUser(fields, role))
        } else {
            alert("You are not authorized to use this admin panel for the registration\nPlease provide the correct key");
        }
    };

    const handleInputChange = (event) => {
        const { name } = event.target;
        if (name === 'email') setEmailError(false);
        if (name === 'password') setPasswordError(false);
        if (name === 'adminName') setAdminNameError(false);
        if (name === 'adminKey') setAdminKeyError(false);
        if (name === 'schoolName') setSchoolNameError(false);
    };

    useEffect(() => {
        if (status === 'success' || (currentUser !== null && currentRole === 'Admin')) {
            navigate('/Admin/dashboard');
        }
        else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
        else if (status === 'error') {
            console.log(error)
        }
    }, [status, currentUser, currentRole, navigate, error, response]);

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="h4" sx={{ mb: 2, color: "#2c2143" }}>
                            Admin Register
                        </Typography>
                        <Typography variant="h7">
                            Create your admin and now you will be able to add staff, receptionist and manage the system.
                        </Typography>
                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 2 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="adminKey"
                                label="Enter admin key"
                                name="key"
                                autoComplete="adminKey"
                                autoFocus
                                error={adminKeyError}
                                helperText={adminKeyError && 'Admin Key is required'}
                                onChange={handleInputChange}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="adminName"
                                label="Enter your name"
                                name="adminName"
                                autoComplete="name"
                                error={adminNameError}
                                helperText={adminNameError && 'Name is required'}
                                onChange={handleInputChange}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="schoolName"
                                label="Create your school name"
                                name="schoolName"
                                autoComplete="off"
                                error={schoolNameError}
                                helperText={schoolNameError && 'School name is required'}
                                onChange={handleInputChange}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Enter your email"
                                name="email"
                                autoComplete="email"
                                error={emailError}
                                helperText={emailError && 'Email is required'}
                                onChange={handleInputChange}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type={toggle ? 'text' : 'password'}
                                id="password"
                                autoComplete="current-password"
                                error={passwordError}
                                helperText={passwordError && 'Password is required'}
                                onChange={handleInputChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setToggle(!toggle)}>
                                                {toggle ? (
                                                    <Visibility />
                                                ) : (
                                                    <VisibilityOff />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            {/* <Grid container sx={{ display: "flex", justifyContent: "space-between" }}>
                                <FormControlLabel
                                    control={<Checkbox value="remember" color="primary" />}
                                    label="Remember me"
                                />
                            </Grid> */}
                            <LightPurpleButton
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Register"}
                            </LightPurpleButton>
                            <Grid container>
                                <Grid>
                                    Already have an account?
                                </Grid>
                                <Grid item sx={{ ml: 2 }}>
                                    <StyledLink to="/Adminlogin">
                                        Log in
                                    </StyledLink>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Grid>

                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '50%',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        display: 'flex',          // Allows centering of the logo
                        alignItems: 'center',     // Vertically centers the logo
                        justifyContent: 'center', // Horizontally centers the logo
                        height: '100vh',          // Ensures the grid item takes full viewport height
                        width: '100%',            // Ensures the grid item takes full width of its container
                    }}
                >
                    <StyledContainerBackground>
                        <CenteredContainer>
                            <StyledLogo src={logo} alt="Logo" />  
                        </CenteredContainer>
                        <StyledCaption>TherapyHome</StyledCaption>
                    </StyledContainerBackground>
                </Grid>
                );
                {/* <StyledLogo src={logo} alt="Logo" /> */}

            </Grid>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </ThemeProvider>
    );
}

export default AdminRegisterPage

const StyledContainer = styled.div`
  // background: linear-gradient(to bottom, #411d70, #19118b);
  height: 100vh; /* Changed to full viewport height */
  display: flex;
  justify-content: center;
  align-items: center; /* Center items vertically */
  padding: 2rem;
`;

const StyledLink = styled(Link)`
  margin-top: 9px;
  text-decoration: none;
  color: #7f56da;
`;
const StyledLogo = styled.img`
    height: 50%;
    margin-bottom: 90px;
    width: 50%;
  max-width: 100%; // Ensures the logo scales within its container
  height: auto;    // Keeps the logo's aspect ratio
//   display: block;  // Remove any inline spacing issues
`;

// Container to center the logo
const CenteredContainer = styled.div`
  display: flex;
  justify-content: center; // Center horizontally
  align-items: center;     // Center vertically
//   height: 100vh;           // Full viewport height
//   width: 100vw;            // Full viewport width
  margin: 0;               // Ensure no extra margin
`;
const StyledContainerBackground = styled.div`
//   display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width:100%;
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