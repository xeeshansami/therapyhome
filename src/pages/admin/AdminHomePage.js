import { Container, Grid, Paper, MenuItem, Select, FormControl, InputLabel,Typography } from '@mui/material';
import SeeNotice from '../../components/SeeNotice';
import Students from "../../assets/img1.png";
import Classes from "../../assets/img2.png";
import Teachers from "../../assets/img3.png";
import Fees from "../../assets/img4.png";
import styled from 'styled-components';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';
import { tokens } from '../../theme';
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
    const [totalDailyFee, setDailyTotalFee] = useState(0);
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
        fetchDailyTotalFee(); // Fetch total fee for the current month by default
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

    const fetchDailyTotalFee = async () => {
        try {
            let url = `${process.env.REACT_APP_BASE_URL}/TotalDailyStudentsFeeCollections`;
            const response = await axios.get(url);
            setDailyTotalFee(response.data.totalFee || 0);
        } catch (error) {
            console.error("Error fetching total fee collection:", error);
        }
    };

    const handleMonthChange = (event) => {
        const month = event.target.value;
        setSelectedMonth(month);
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
                            <MotionCard $gradient={tokens.gradients.indigo} {...cardMotion(0)}>
                                <img src={Students} alt="Students" />
                                <Title>Total Students</Title>
                                <Data start={0} end={numberOfStudents} duration={2.5} />
                            </MotionCard>
                        </Grid>
                        <Grid item xs={12} md={3} lg={3}>
                            <MotionCard $gradient={tokens.gradients.amber} {...cardMotion(1)}>
                                <img src={Classes} alt="Classes" />
                                <Title>Total Classes</Title>
                                <Data start={0} end={numberOfClasses} duration={5} />
                            </MotionCard>
                        </Grid>
                        <Grid item xs={12} md={3} lg={3}>
                            <MotionCard $gradient={tokens.gradients.purple} {...cardMotion(2)}>
                                <img src={Teachers} alt="Teachers" />
                                <Title>Total Teachers</Title>
                                <Data start={0} end={numberOfTeachers} duration={2.5} />
                            </MotionCard>
                        </Grid>
                        <Grid item xs={12} md={3} lg={3}>
                            <MotionCard $gradient={tokens.gradients.teal} {...cardMotion(3)}>
                                <img src={Fees} alt="Fees" />
                                <Title>Fees Collection Daily</Title>
                                <Data start={0} end={totalDailyFee} duration={2.5} prefix="PKR " />
                            </MotionCard>
                        </Grid>
                        <Grid item xs={12} md={3} lg={3}>
                            <MotionCard $gradient={tokens.gradients.red} {...cardMotion(4)}>
                                <img src={Fees} alt="Fees" />
                                <Title>Fees Collection Monthly</Title>

                                <Typography variant="h6" style={{ color: '#ffffff', fontWeight: 'bold' }}>
                                    <Data start={0} end={totalFee} duration={2.5} prefix="PKR " />
                                </Typography>

                            </MotionCard>
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
  && {
    position: relative;
    padding: 22px 20px;
    display: flex;
    flex-direction: column;
    height: 200px;
    justify-content: space-between;
    align-items: flex-start;
    text-align: left;
    color: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    background: ${(props) => props.$gradient || tokens.gradients.indigo};
    box-shadow: 0 10px 24px rgba(45, 55, 99, 0.12);
  }
  && img {
    width: 56px;
    height: 56px;
    padding: 12px;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.22);
    border-radius: 14px;
    object-fit: contain;
  }
  &&::after {
    content: "";
    position: absolute;
    right: -28px;
    bottom: -28px;
    width: 110px;
    height: 110px;
    background: rgba(255, 255, 255, 0.12);
    border-radius: 50%;
  }
`;

// Motion-enabled stat card: keeps all StyledPaper visuals, adds a soft
// entrance + hover lift. Transient $gradient prop is consumed by styled().
const MotionCard = motion(StyledPaper);

const cardMotion = (i) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  whileHover: { y: -6 },
  transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
});

const Title = styled.p`
  font-size: 0.95rem;
  font-weight: 500;
  opacity: 0.95;
  margin: 0;
`;

const Data = styled(CountUp)`
  font-size: 1.9rem;
  font-weight: 700;
  color: #ffffff;
`;

const StyledContainerBackground = styled.div`
  display: flex;
  min-height: 100%;
  background: var(--color-bg-app);
`;

export default AdminHomePage;
