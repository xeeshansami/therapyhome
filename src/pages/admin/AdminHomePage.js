import { Box, Container, Grid, Paper, MenuItem, Select, FormControl, InputLabel, Stack, Typography } from '@mui/material';
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

                    <Grid container spacing={2.5}>
                        {[
                            { icon: Students, accent: '#7C3AED', label: 'Total Students', value: numberOfStudents, duration: 2.5 },
                            { icon: Classes, accent: '#F59E0B', label: 'Total Classes', value: numberOfClasses, duration: 5 },
                            { icon: Teachers, accent: '#2563EB', label: 'Total Teachers', value: numberOfTeachers, duration: 2.5 },
                            { icon: Fees, accent: '#10B981', label: 'Fees Collection Daily', value: totalDailyFee, duration: 2.5, prefix: 'PKR ' },
                            { icon: Fees, accent: '#F43F5E', label: 'Fees Collection Monthly', value: totalFee, duration: 2.5, prefix: 'PKR ' },
                        ].map((card, i) => (
                            <Grid item xs={12} sm={6} md={3} lg={3} key={card.label}>
                                <MotionCard $accent={card.accent} {...cardMotion(i)}>
                                    <Stack direction="row" spacing={1.75} alignItems="center">
                                        <IconTile $accent={card.accent}>
                                            <img src={card.icon} alt="" />
                                        </IconTile>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Title>{card.label}</Title>
                                            <Value>
                                                <Data start={0} end={card.value} duration={card.duration} prefix={card.prefix} />
                                            </Value>
                                        </Box>
                                    </Stack>
                                </MotionCard>
                            </Grid>
                        ))}
                        <Grid item xs={12} md={12} lg={12}>
                            <Paper sx={{ p: 2.5, display: 'flex', flexDirection: 'column' }}>
                                <SeeNotice />
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </StyledContainerBackground>
        </>
    );
};

// Surface-coloured stat card: the accent now lives in the icon tile instead of
// flooding the whole card, which keeps the figures high-contrast in both modes.
// Paper supplies the themed background, so no colour is hardcoded here.
const StyledPaper = styled(Paper)`
  && {
    position: relative;
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    min-height: 96px;
    justify-content: center;
    align-items: stretch;
    text-align: left;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid var(--th-card-border, rgba(15, 23, 42, 0.08));
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
  }
  &&::after {
    content: "";
    position: absolute;
    right: -34px;
    bottom: -34px;
    width: 104px;
    height: 104px;
    background: ${(props) => props.$accent || tokens.primary};
    opacity: 0.05;
    border-radius: 50%;
  }
`;

// Motion-enabled stat card: keeps all StyledPaper visuals, adds a soft
// entrance + hover lift. Transient $gradient prop is consumed by styled().
const MotionCard = motion(StyledPaper);

// The entrance is done in CSS (.th-fade-up) rather than through motion props.
// A JS-driven `initial: { opacity: 0 }` leaves the card permanently invisible
// and offset if the animation never runs, which hid the whole dashboard.
// Hover stays on motion since it cannot hide content.
const cardMotion = (i) => ({
  className: `th-fade-up${i > 0 && i < 5 ? ` th-fade-up-${Math.min(i, 4)}` : ''}`,
  whileHover: { y: -6 },
  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
});

const IconTile = styled.span`
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: ${(props) => `${props.$accent || tokens.primary}1f`};
  img {
    width: 22px;
    height: 22px;
    object-fit: contain;
  }
`;

const Title = styled.p`
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--th-muted, #64748b);
  margin: 0 0 2px;
`;

const Value = styled.div`
  font-size: 1.375rem;
  font-weight: 700;
  line-height: 1.2;
`;

const Data = styled(CountUp)`
  font-weight: 700;
`;

const StyledContainerBackground = styled.div`
  display: flex;
  min-height: 100%;
  background: var(--color-bg-app);
`;

export default AdminHomePage;
