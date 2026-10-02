import * as React from 'react';
import { useDispatch } from 'react-redux';
import { underControl } from '../redux/userRelated/userSlice';
import { underStudentControl } from '../redux/studentRelated/studentSlice';
import MuiAlert from '@mui/material/Alert';
import { Snackbar } from '@mui/material';

// Accepts both prop shapes:
//   new: { open, message, success, onClose }        - detail/edit pages
//   old: { showPopup, setShowPopup, message }       - login, notices, marks, etc.
// Keeping both means the newer pages can pass an explicit severity while the
// older callers keep their redux status reset on close.
const Popup = ({ message, setShowPopup, showPopup, open, success, onClose }) => {
    const dispatch = useDispatch();

    const isLegacy = typeof setShowPopup === 'function';
    const isOpen = isLegacy ? showPopup : open;

    const vertical = "top"
    const horizontal = "right"

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        if (isLegacy) {
            setShowPopup(false);
            dispatch(underControl())
            dispatch(underStudentControl())
        } else if (onClose) {
            onClose();
        }
    };

    // Legacy callers signalled success through the message text itself.
    const severity = isLegacy
        ? (message === "Done Successfully" ? "success" : "error")
        : (success ? "success" : "error");

    return (
        <>
            <Snackbar open={Boolean(isOpen)} autoHideDuration={2000} onClose={handleClose} anchorOrigin={{ vertical, horizontal }} key={vertical + horizontal}>
                <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
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
