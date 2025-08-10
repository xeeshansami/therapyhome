import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import {
    Paper, Box, IconButton, Modal, Typography, CircularProgress,
    List, ListItem, ListItemText, Divider
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import axios from 'axios';

// Style for the modal
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: '8px',
};

const ShowStudents = () => {
    // --- SECTION: Core Component State & Hooks ---
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { studentsList, loading, error, response } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user);

    // --- SECTION: UI State (Popups & Modals) ---
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState([]);

    // --- SECTION: State for Asynchronous Class Data ---
    const [classDetailsMap, setClassDetailsMap] = useState(new Map());
    const [classDetailsLoading, setClassDetailsLoading] = useState(false);
    const [classDetailsError, setClassDetailsError] = useState(null);

    // --- SECTION: Data Fetching Effects ---

    // Effect to fetch the initial list of students
    useEffect(() => {
        dispatch(getAllStudents(currentUser._id));
    }, [currentUser._id, dispatch]);

    // Effect to fetch details for all classes once the student list is available
    useEffect(() => {
        if (studentsList && studentsList.length > 0) {
            const fetchAllClassDetails = async () => {
                setClassDetailsLoading(true);
                setClassDetailsError(null); // Reset error state on new fetch

                // Collect all unique class IDs to avoid redundant API calls
                const allClassIDs = new Set(studentsList.flatMap(student => student.className));

                const promises = Array.from(allClassIDs).map(id =>
                    axios.get(`${process.env.REACT_APP_BASE_URL}/Sclass/${id}`)
                );

                try {
                    const results = await Promise.all(promises);
                    const newClassDetails = new Map();
                    results.forEach(result => {
                        if (result.data) {
                            // Store the entire class object in the map, keyed by its ID
                            newClassDetails.set(result.data._id, result.data);
                        }
                    });
                    setClassDetailsMap(newClassDetails);
                } catch (err) {
                    console.error("Failed to fetch class details", err);
                    setClassDetailsError("Could not load class details. Please try again.");
                } finally {
                    setClassDetailsLoading(false);
                }
            };

            fetchAllClassDetails();
        }
    }, [studentsList]);

    // --- SECTION: Event Handlers ---

    const deleteHandler = (deleteID, address) => {
        setMessage("Sorry, the delete function has been disabled for now.");
        setShowPopup(true);
    };

    const handleViewClasses = (classes) => {
        setModalData(classes);
        setIsModalOpen(true);
    };

    // --- SECTION: Data Preparation for Table ---

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
        { id: 'sclassName', label: 'Classes', minWidth: 250 },
    ];

    const studentRows = studentsList && studentsList.length > 0 && studentsList.map((student) => {
        // For each student, find their class objects from the details map
        const enrolledClasses = student.className.map(id =>
            classDetailsMap.get(id) || { _id: id, sclassName: 'Loading...' }
        );

        let classDisplay;
        if (classDetailsLoading) {
            classDisplay = <CircularProgress size={20} />;
        } else if (classDetailsError) {
            classDisplay = <Typography color="error" variant="body2">{classDetailsError}</Typography>;
        } else {
            classDisplay = enrolledClasses.map(c => c.sclassName).join(', ');
        }

        return {
            name: student.name,
            rollNum: student.rollNum,
            sclassName: classDisplay,
            classes: classDetailsError ? [] : enrolledClasses, // Pass empty array on error
            id: student._id,
        };
    });

    // --- SECTION: Sub-components & Actions ---

    const StudentButtonHaver = ({ row }) => (
        <>
            <IconButton onClick={() => deleteHandler(row.id, "Student")}>
                <PersonRemoveIcon color="error" />
            </IconButton>
            <BlueButton variant="contained" onClick={() => navigate("/Admin/students/student/" + row.id)}>
                View
            </BlueButton>
            <GreenButton
                variant="contained"
                sx={{ ml: 1 }}
                onClick={() => handleViewClasses(row.classes)}
                disabled={classDetailsLoading || classDetailsError}
            >
                View Classes
            </GreenButton>
        </>
    );

    const actions = [
        { icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Student', action: () => navigate("/Admin/addstudents") },
        { icon: <PersonRemoveIcon color="error" />, name: 'Delete All Students', action: () => deleteHandler(currentUser._id, "Students") },
    ];

    // --- SECTION: Main Component Render ---

    return (
        <>
            {loading ? <div>Loading...</div> : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    {Array.isArray(studentsList) && studentsList.length > 0 ? (
                        <TableTemplate buttonHaver={StudentButtonHaver} columns={studentColumns} rows={studentRows} />
                    ) : (
                        <Typography variant="h6" sx={{ p: 2, textAlign: 'center' }}>
                            No students found.
                        </Typography>
                    )}
                    <SpeedDialTemplate actions={actions} />
                </Paper>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />

            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                aria-labelledby="view-classes-modal-title"
            >
                <Box sx={modalStyle}>
                    <Typography id="view-classes-modal-title" variant="h6" component="h2" gutterBottom>
                        Enrolled Classes
                    </Typography>
                    <List>
                        {modalData.map((sClass, index) => (
                            <React.Fragment key={sClass._id}>
                                <ListItem alignItems="flex-start" sx={{ pl: 0 }}>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                {sClass.sclassName || 'N/A'}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box component="span" sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
                                                <Typography component="span" variant="body2">
                                                    <strong>Timing:</strong> {sClass.timingSlot || 'N/A'} ({sClass.timingType || 'N/A'})
                                                </Typography>
                                                <Typography component="span" variant="body2">
                                                    <strong>Fee:</strong> Rs. {sClass.sclassFee || 'N/A'}
                                                </Typography>
                                                <Typography component="span" variant="body2" color="text.secondary">
                                                    <strong>Created On:</strong> {sClass.createdAt ? new Date(sClass.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                {index < modalData.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </Box>
            </Modal>
        </>
    );
};

export default ShowStudents;