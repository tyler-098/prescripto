import { createContext, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

export const AdminContext = createContext();
import { useEffect } from "react";


const AdminContextProvider = (props) => {
    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : '');
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(false);

    const backendurl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'; // Fallback
    const cloudinaryConfig = {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dwsvxksb8', // Hardcoded fallback
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'prescripto_upload', // Hardcoded fallback
    };

    // Detailed debugging (removed process)
    console.log('Raw Import.meta.env Object:', import.meta.env);
    console.log('Explicit Env Vars Check:', {
        VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
        VITE_CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        VITE_CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    });
    console.log('Final Cloudinary Config:', cloudinaryConfig);

    if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
        console.error('Invalid Cloudinary configuration:', cloudinaryConfig);
        toast.error('Cloudinary configuration is missing or invalid. Please check .env and restart the server.');
    }

    const getAllDoctors = async () => {
        try {
            const { data } = await axios.post(backendurl + '/api/admin/all-doctors', {}, { headers: { aToken } });
            if (data.success) {
                setDoctors(data.doctors);
                console.log(data.doctors);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const changeAvailability = async (docId) => {
        try {
            const { data } = await axios.post(backendurl + '/api/admin/change-availability', { docId }, { headers: { aToken } });
            if (data.success) {
                toast.success(data.message);
                getAllDoctors();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getAllAppointments = async () => {
        try {
            const { data } = await axios.get(backendurl + '/api/admin/appointments', {
                headers: { aToken }
            });
            if (data.success) {
                // Sort by booking date (newest first) and update state only if different
                const sortedAppointments = data.appointments.sort((a, b) => new Date(b.date) - new Date(a.date));
                setAppointments((prevAppointments) => {
                    if (JSON.stringify(prevAppointments) !== JSON.stringify(sortedAppointments)) {
                        console.log('Appointments updated:', sortedAppointments);
                        return sortedAppointments;
                    }
                    return prevAppointments;
                });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendurl + '/api/admin/cancel-appointment', { appointmentId }, { headers: { aToken } });
            if (data.success) {
                toast.success(data.message);
                getAllAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getDashData = async () => {
        try {
            const { data } = await axios.get(backendurl + '/api/admin/dashboard', { headers: { aToken } });
            if (data.success) {
                setDashData(data.dashData);
                console.log(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getQueuePosition = async (docId) => {
        try {
            const { data } = await axios.get(backendurl + `/api/admin/doctor-queue-position`, {
                headers: { aToken },
                params: { docId }
            });
            if (data.success) {
                console.log('Queue position:', data.queuePosition, 'Available slots:', data.availableSlots, 'Tomorrow slots:', data.tomorrowSlots);
                return { queuePosition: data.queuePosition, availableSlots: data.availableSlots, tomorrowSlots: data.tomorrowSlots };
            } else {
                toast.error(data.message);
                return { queuePosition: null, availableSlots: [], tomorrowSlots: [] };
            }
        } catch (error) {
            console.log('getQueuePosition error:', error);
            toast.error(error.message);
            return { queuePosition: null, availableSlots: [], tomorrowSlots: [] };
        }
    };


    const addPatient = async (patientData) => {
        try {
            const { data } = await axios.post(
                backendurl + '/api/admin/add-patient',
                { ...patientData, bookingMode: 'queue' },
                { headers: { aToken } }
            );
            if (data.success) {
                toast.success('Patient added successfully');
                await Promise.all([getAllAppointments(), getDashData()]);
                return data.appointment;
            } else {
                toast.error(data.message);
                return null;
            }
        } catch (error) {
            console.log('addPatient error:', error);
            toast.error(error.message);
            return null;
        }
    };


    const completeAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendurl + '/api/admin/complete-appointment',
                { appointmentId },
                {
                    headers: { aToken }
                });
            if (data.success) {
                toast.success(data.message);
                getAllAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (aToken) {
            getAllAppointments(); // Initial fetch
            const intervalId = setInterval(() => {
                getAllAppointments();
            }, 15000); // Poll every 30 seconds

            // Cleanup interval on unmount
            return () => clearInterval(intervalId);
        }
    }, [aToken]);

    const value = {
        aToken,
        setAToken,
        backendurl,
        doctors,
        getAllDoctors,
        changeAvailability,
        appointments,
        setAppointments,
        getAllAppointments,
        cancelAppointment,
        dashData,
        getDashData,
        cloudinaryConfig,
        completeAppointment,
        getQueuePosition,
        addPatient
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;