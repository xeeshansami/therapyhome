import { Container, Grid, Paper } from '@mui/material'
import SeeNotice from '../../components/SeeNotice';
import CountUp from 'react-countup';
import styled from 'styled-components';
import Students from "../../assets/img1.png";
import Lessons from "../../assets/subjects.svg";
import Tests from "../../assets/assignment.svg";
import Time from "../../assets/time.svg";
import { getClassStudents, getSubjectDetails } from '../../redux/sclassRelated/sclassHandle';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { tokens } from '../../theme';

const TeacherHomePage = () => {
    const dispatch = useDispatch();

    const { currentUser } = useSelector((state) => state.user);
    const { subjectDetails, sclassStudents } = useSelector((state) => state.sclass);

    const classID = currentUser.teachSclass?._id
    const subjectID = currentUser.teachSubject?._id

    useEffect(() => {
        dispatch(getSubjectDetails(subjectID, "Subject"));
        dispatch(getClassStudents(classID));
    }, [dispatch, subjectID, classID]);

    const numberOfStudents = sclassStudents && sclassStudents.length;
    const numberOfSessions = subjectDetails && subjectDetails.sessions

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper $gradient={tokens.gradients.indigo}>
                            <img src={Students} alt="Students" />
                            <Title>
                                Class Students
                            </Title>
                            <Data start={0} end={numberOfStudents} duration={2.5} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper $gradient={tokens.gradients.amber}>
                            <img src={Lessons} alt="Lessons" />
                            <Title>
                                Total Lessons
                            </Title>
                            <Data start={0} end={numberOfSessions} duration={5} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper $gradient={tokens.gradients.purple}>
                            <img src={Tests} alt="Tests" />
                            <Title>
                                Tests Taken
                            </Title>
                            <Data start={0} end={24} duration={4} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper $gradient={tokens.gradients.red}>
                            <img src={Time} alt="Time" />
                            <Title>
                                Total Hours
                            </Title>
                            <Data start={0} end={30} duration={4} suffix="hrs"/>                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <SeeNotice />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    )
}

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

export default TeacherHomePage