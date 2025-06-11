import axios from 'axios';
import {
    authRequest,
    stuffAdded,
    authSuccess,
    authFailed,
    authError,
    authLogout,
    doneSuccess,
    getDeleteSuccess,
    getRequest,
    getFailed,
    getError,
} from './userSlice'; // Ensure `addStudentFee` is not imported here

export const loginUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${role}Login`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        debugger
        if (result.data.role) {
            dispatch(authSuccess(result.data));
        } else {
            dispatch(authFailed(result.data.message));
        }
    } catch (error) {
        dispatch(authError(error));
    }
};

export const registerUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    try {
        console.log("fields", fields);
        debugger
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${role}Reg`, fields, {
            // headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.status === "00") {
            dispatch(authSuccess(result.data.message));
            return { status: result.data.status, message: result.data.message };
        } else {
            dispatch(authFailed(result.data.message));
            return { status: result.data.status, message: result.data.message };
        }
    } catch (error) {
        dispatch(authError(error.message));
        return { status: "99", message: error.message }; // Use fallback status code
    }
};

export const consultancyRegister = (fields) => async (dispatch) => {
    dispatch(authRequest());
    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/StudentConsultancy`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        // Check result.data.status instead of result.status
        if (result.data.status === "00") {
            dispatch(authSuccess(result.data.message));
            return { status: result.data.status, message: result.data.message };
        } else {
            dispatch(authFailed(result.data.message));
            return { status: result.data.status, message: result.data.message };
        }
    } catch (error) {
        dispatch(authError(error.message));
        return { status: "99", message: error.message }; // Use fallback status code
    }
};

export const addStudentFee = (fields, role) => async (dispatch) => { // Renamed function
    dispatch(authRequest());

    try {
        console.log("fields", fields);
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/StudentFeeReg`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.schoolName) {
            dispatch(authSuccess(result.data));
        } else if (result.data.school) {
            dispatch(stuffAdded());
        } else {
            dispatch(authFailed(result.data.message));
        }
    } catch (error) {
        dispatch(authError(error));
    }
};

export const logoutUser = () => (dispatch) => {
    dispatch(authLogout());
};

export const getUserDetails = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
};

export const deleteUser = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    dispatch(getFailed("Sorry, the delete function has been disabled for now."));
};

export const updateUser = (fields, id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.schoolName) {
            dispatch(authSuccess(result.data));
        } else {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
};

export const addStuff = (fields, address) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${address}Create`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (result.data.message) {
            dispatch(authFailed(result.data.message));
        } else {
            dispatch(stuffAdded(result.data));
        }
    } catch (error) {
        dispatch(authError(error));
    }
};
