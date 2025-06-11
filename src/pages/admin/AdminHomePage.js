import { Container, Grid, Paper, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import SeeNotice from '../../components/SeeNotice';
import Students from "../../assets/img1.png";
import Classes from "../../assets/img2.png";
import Teachers from "../../assets/img3.png";
import Fees from "../../assets/img4.png";
import styled from 'styled-components';
import CountUp from 'react-countup';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';
import background from "../../assets/background2.jpg";
import axios from 'axios';

const AdminHomePage = () => {
    const dispatch = useDispatch();
    const { studentsList } = useSelector((state) => state.student);
    const { sclassesList } = useSelector((state) => state.sclass);
    const { teachersList } = useSelector((state) => state.teacher);
    const months = [
        "January", "February", "March", "April", "May",
        "June", "July", "August", "September",
        "October", "November", "December"
    ];
    const { currentUser } = useSelector(state => state.user);

    const adminID = currentUser._id;

    // State for storing total fee collection and selected month
    const [totalFee, setTotalFee] = useState(0);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const currentMonthIndex = new Date().getMonth();
        return months[currentMonthIndex];
    });

    // Months array


    useEffect(() => {
        dispatch(getAllStudents(adminID));
        dispatch(getAllSclasses(adminID, "Sclass"));
        dispatch(getAllTeachers(adminID));

        fetchTotalFee(selectedMonth); // Fetch total fee for the current month by default
    }, [adminID, dispatch]);

    const fetchTotalFee = async (month) => {
        try {
            let url = `${process.env.REACT_APP_BASE_URL}/TotalStudentsFeeCollections?month=${month}`;
            const response = await axios.get(url);
            setTotalFee(response.data.totalFee || 0);
        } catch (error) {
            console.error("Error fetching total fee collection:", error);
        }
    };

    const handleMonthChange = (event) => {
        const month = event.target.value;
        setSelectedMonth(month);
        debugger
        fetchTotalFee(month); // Fetch total fee for the selected month
    };

    const numberOfStudents = studentsList && studentsList.length;
    const numberOfClasses = sclassesList && sclassesList.length;
    const numberOfTeachers = teachersList && teachersList.length;

    
    return (
        
        <>
            <StyledContainerBackground>
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Grid item xs={12} md={3} lg={3}>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            {/* <InputLabel id="month-select-label">Select Month</InputLabel> */}
                            <Select
                                labelId="month-select-label"
                                value={selectedMonth}
                                onChange={handleMonthChange}
                                sx={{ backgroundColor: "white" }} // White background for dropdown
                            >
                                {months.map((month, index) => (
                                    <MenuItem key={index} value={month}>
                                        {month}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3} lg={3}>
                            <StyledPaper>
                                <img src={Students} alt="Students" />
                                <Title>Total Students</Title>
                                <Data start={0} end={numberOfStudents} duration={2.5} />
                            </StyledPaper>
                        </Grid>
                        <Grid item xs={12} md={3} lg={3}>
                            <StyledPaper>
                                <img src={Classes} alt="Classes" />
                                <Title>Total Classes</Title>
                                <Data start={0} end={numberOfClasses} duration={5} />
                            </StyledPaper>
                        </Grid>
                        <Grid item xs={12} md={3} lg={3}>
                            <StyledPaper>
                                <img src={Teachers} alt="Teachers" />
                                <Title>Total Teachers</Title>
                                <Data start={0} end={numberOfTeachers} duration={2.5} />
                            </StyledPaper>
                        </Grid>
                        <Grid item xs={12} md={3} lg={3}>
                            <StyledPaper>
                                <img src={Fees} alt="Fees" />
                                <Title>Fees Collection</Title>
                                <Data start={0} end={totalFee} duration={2.5} prefix="PKR " />
                            </StyledPaper>
                        </Grid>
                        <Grid item xs={12} md={12} lg={12}>
                            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                                <SeeNotice />
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </StyledContainerBackground>
        </>
    );
};

const StyledPaper = styled(Paper)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 200px;
  justify-content: space-between;
  align-items: center;
  text-align: center;
`;

const Title = styled.p`
  font-size: 1.25rem;
`;

const Data = styled(CountUp)`
  font-size: calc(1.3rem + .6vw);
  color: green;
`;

const StyledContainerBackground = styled.div`
  display: flex;
  height: 100vh;
  font-family: "Josefin Sans", sans-serif;
  color: white;
  background-image: url(${background});
  background-size: cover;
`;

export default AdminHomePage;
