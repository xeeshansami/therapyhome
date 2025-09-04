import * as React from 'react';
import MuiAlert from '@mui/material/Alert';
import { Snackbar } from '@mui/material';

// Use standard, descriptive prop names
const Popup = ({ open, message, success, onClose }) => {

    const vertical = "top"
    const horizontal = "right"

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        onClose(); // Call the onClose function passed from the parent
    };

    return (
        <>
            <Snackbar open={open} autoHideDuration={2000} onClose={handleClose} anchorOrigin={{ vertical, horizontal }} key={vertical + horizontal}>
                {/* Use the 'success' prop to determine severity */}
                <Alert onClose={handleClose} severity={success ? "success" : "error"} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default Popup;

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});