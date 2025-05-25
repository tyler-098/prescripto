import React, { useContext, useState, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const AllAppointment = () => {
    const { aToken, appointments, getAllAppointments, cancelAppointment, completeAppointment } = useContext(AdminContext);
    const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

    const [filterStatus, setFilterStatus] = useState('All');
    const [sortBy, setSortBy] = useState('date');
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);

    const generateToken = (appointment) => {
        if (appointment.bookingMode !== 'queue') return null;
        const date = appointment.slotDate.split('_')[0]; // e.g., "20"
        const slotHours = {
            '10:00 am': 1,
            '12:00 pm': 2,
            '03:00 pm': 3,
            '05:00 pm': 4
        };
        const slot = slotHours[appointment.slotTime] || 1;
        const queue = appointment.queuePosition || 1;
        return `#${date}${slot < 10 ? '0' : ''}${slot}${queue < 10 ? '0' : ''}${queue}`;
    };

    const filterAndSortAppointments = () => {
        let result = [...appointments];

        // Filter by status
        if (filterStatus === 'Pending') {
            result = result.filter(item => !item.cancelled && !item.isCompleted);
        } else if (filterStatus === 'Completed') {
            result = result.filter(item => item.isCompleted);
        } else if (filterStatus === 'Canceled') {
            result = result.filter(item => item.cancelled);
        }

        // Sort
        if (sortBy === 'date') {
            result.sort((a, b) => {
                const dateA = new Date(a.slotDate.split('_').reverse().join('-') + ' ' + a.slotTime);
                const dateB = new Date(b.slotDate.split('_').reverse().join('-') + ' ' + b.slotTime);
                return dateB - dateA; // Newest first
            });
        } else if (sortBy === 'patient') {
            result.sort((a, b) => a.userData.name.localeCompare(b.userData.name));
        }

        setFilteredAppointments(result);
    };

    useEffect(() => {
        if (aToken) {
            getAllAppointments();
        }
    }, [aToken]);

    useEffect(() => {
        filterAndSortAppointments();
    }, [appointments, filterStatus, sortBy]);

    const openDetailsModal = (appointment) => {
        setSelectedAppointment(appointment);
        setShowDetailsModal(true);
    };

    const handleCancelConfirm = (appointmentId) => {
        setAppointmentToCancel(appointmentId);
        setShowCancelConfirm(true);
    };

    const confirmCancel = async () => {
        try {
            await cancelAppointment(appointmentToCancel);
            setShowCancelConfirm(false);
            setAppointmentToCancel(null);
        } catch (error) {
            toast.error('Failed to cancel appointment');
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-800">All Appointments</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center">
                        <label className="text-sm text-gray-600 mr-2">Filter:</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Canceled">Canceled</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <label className="text-sm text-gray-600 mr-2">Sort By:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="date">Date</option>
                            <option value="patient">Patient Name</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
                <div className="grid grid-cols-[0.5fr_2fr_1fr_1.5fr_2fr_2fr_1fr_1fr_1.5fr] items-center py-3 px-6 border-b bg-gray-50 text-sm font-medium text-gray-600 sm:grid">
                    <p>#</p>
                    <p>Patient</p>
                    <p className="hidden sm:block">Age</p>
                    <p>Mode</p>
                    <p>Date & Time</p>
                    <p>Doctor</p>
                    <p>Fees</p>
                    <p>Status</p>
                    <p>Actions</p>
                </div>

                {filteredAppointments.length === 0 ? (
                    <div className="py-6 px-6 text-center text-gray-500">No appointments found</div>
                ) : (
                    filteredAppointments.map((item, index) => (
                        <div
                            className="grid grid-cols-[0.5fr_2fr_1fr_1.5fr_2fr_2fr_1fr_1fr_1.5fr] items-center py-3 px-6 border-b text-sm text-gray-600 hover:bg-gray-50 sm:grid"
                            key={item._id}
                        >
                            <p className="hidden sm:block">{index + 1}</p>
                            <div className="flex items-center gap-2">
                                <img className="w-8 h-8 rounded-full object-cover" src={item.userData.image} alt="" />
                                <p className="truncate">{item.userData.name}</p>
                            </div>
                            <p className="hidden sm:block">{calculateAge(item.userData.dob)}</p>
                            <div>
                                {item.bookingMode === 'priority' ? (
                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                                        Priority
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                                        Queue {generateToken(item)}
                                    </span>
                                )}
                            </div>
                            <p className="truncate">
                                {slotDateFormat(item.slotDate)}, {item.slotTime}
                            </p>
                            <div className="flex items-center gap-2">
                                <img className="w-8 h-8 rounded-full object-cover bg-gray-200" src={item.docData.image} alt="" />
                                <p className="truncate">{item.docData.name}</p>
                            </div>
                            <p>
                                {currency}
                                {item.amount}
                            </p>
                            <p>
                                {item.cancelled ? (
                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                                        Canceled
                                    </span>
                                ) : item.isCompleted ? (
                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                        Completed
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
                                        Pending
                                    </span>
                                )}
                            </p>
                            <div className="flex items-center gap-2">
                                {!item.cancelled && !item.isCompleted && (
                                    <>
                                        <button
                                            onClick={() => completeAppointment(item._id)}
                                            className="p-1.5 text-green-600 hover:text-green-800"
                                            title="Mark as Completed"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleCancelConfirm(item._id)}
                                            className="p-1.5 text-red-600 hover:text-red-800"
                                            title="Cancel Appointment"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => openDetailsModal(item)}
                                    className="p-1.5 text-blue-600 hover:text-blue-800"
                                    title="View Details"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Patient Details Modal */}
            {showDetailsModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Patient Details</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                            <p>
                                <span className="font-medium">Name:</span> {selectedAppointment.userData.name}
                            </p>
                            <p>
                                <span className="font-medium">Age:</span> {calculateAge(selectedAppointment.userData.dob)}
                            </p>
                            <p>
                                <span className="font-medium">Mode:</span>{' '}
                                {selectedAppointment.bookingMode === 'priority'
                                    ? 'Priority'
                                    : `Queue ${generateToken(selectedAppointment)}`}
                            </p>
                            <p>
                                <span className="font-medium">Date & Time:</span>{' '}
                                {slotDateFormat(selectedAppointment.slotDate)}, {selectedAppointment.slotTime}
                            </p>
                            <p>
                                <span className="font-medium">Description:</span>{' '}
                                {selectedAppointment.description || 'Not provided'}
                            </p>
                            {selectedAppointment.attachmentUrl && (
                                <p>
                                    <span className="font-medium">Attachment:</span>{' '}
                                    <a
                                        href={selectedAppointment.attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        View Document
                                    </a>
                                </p>
                            )}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Cancellation</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to cancel this appointment?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                            >
                                No
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllAppointment;