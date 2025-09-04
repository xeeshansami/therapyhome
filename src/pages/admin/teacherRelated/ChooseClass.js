import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { useNavigate } from 'react-router-dom';
import { PurpleButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import axios from 'axios';

const ChooseClass = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { sclassesList, loading: sclassLoading } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);

    // State for designations
    const [designations, setDesignations] = useState([]);
    const [designationLoader, setDesignationLoader] = useState(true);
    const [selectedDesignation, setSelectedDesignation] = useState('');
    const [selectedDesignationObject, setSelectedDesignationObject] = useState(null);
    const [isTeacher, setIsTeacher] = useState(false);

    // Fetch designations on component mount
    useEffect(() => {
        const fetchDesignations = async () => {
            try {
                const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/designations`);
                if (result.data) {
                    setDesignations(result.data);
                }
            } catch (err) {
                console.error("Error fetching designations:", err.message);
            } finally {
                setDesignationLoader(false);
            }
        };
        fetchDesignations();
    }, []);

    // Handle designation selection
    const handleDesignationChange = (event) => {
        const designationId = event.target.value;
        const designationObject = designations.find(des => des._id === designationId);
        
        
        setSelectedDesignation(designationId);
        setSelectedDesignationObject(designationObject);

        // Check if the selected designation is 'Teacher'
        if (designationObject && designationObject.title.toLowerCase() === 'teacher') {
            setIsTeacher(true);
            dispatch(getAllSclasses(currentUser._id, "Sclass"));
        } else {
            setIsTeacher(false);
        }
    };

    const navigateWithClass = (classID) => {
        navigate(`/Admin/teachers/addteacher/${classID}`, {
            state: {
                designationID: selectedDesignation,
                designationTitle: selectedDesignationObject?.title,
            }
        });
    };

    // ✅ FIX: Added a placeholder "noclass" to the URL to satisfy the router.
    const navigateWithoutClass = () => {
        navigate("/Admin/teachers/addteacher/noclass", {
            state: {
                designationID: selectedDesignation,
                designationTitle: selectedDesignationObject?.title,
            }
        });
    };

    const sclassColumns = [{ id: 'name', label: 'Class Names', minWidth: 170 }];
    const sclassRows = sclassesList.map((sclass) => ({
        name: sclass.sclassName,
        id: sclass._id,
    }));

    const SclassButtonHaver = ({ row }) => (
        <PurpleButton variant="contained" onClick={() => navigateWithClass(row.id)}>
            Choose
        </PurpleButton>
    );

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Step 1: Select Designation</Typography>
            <FormControl fullWidth sx={{ mb: 4 }}>
                <InputLabel id="designation-select-label">Designation</InputLabel>
                <Select
                    labelId="designation-select-label"
                    value={selectedDesignation}
                    label="Designation"
                    onChange={handleDesignationChange}
                    disabled={designationLoader}
                >
                    {designationLoader ? (
                        <MenuItem disabled value=""><em>Loading...</em></MenuItem>
                    ) : (
                        designations.map((des) => (
                            <MenuItem key={des._id} value={des._id}>{des.title}</MenuItem>
                        ))
                    )}
                </Select>
            </FormControl>

            {isTeacher && (
                <>
                    {sclassLoading ? (
                        <CircularProgress />
                    ) : (
                        <>
                            <Typography variant="h6" gutterBottom>Step 2: Choose a Class for the Teacher</Typography>
                            {Array.isArray(sclassesList) && sclassesList.length > 0 ? (
                                <TableTemplate buttonHaver={SclassButtonHaver} columns={sclassColumns} rows={sclassRows} />
                            ) : (
                                <Typography>No classes found. Please add a class first.</Typography>
                            )}
                        </>
                    )}
                </>
            )}

            {selectedDesignation && !isTeacher && (
                 <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button variant="contained" color="primary" onClick={navigateWithoutClass}>
                        Proceed to Add Employee
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default ChooseClass;
