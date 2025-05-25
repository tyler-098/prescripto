import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { assets1 } from '../../assets/assets1';

const DoctorAppointment = () => {
    const { dToken, appointments, getAppointments, completeAppointments, cancelAppointments } = useContext(DoctorContext);
    const { calculateAge, slotDateFormat, currency } = useContext(AppContext);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date'); // Options: 'date', 'bookingMode', 'token'
    const [sortOrder, setSortOrder] = useState('desc'); // Options: 'asc', 'desc', 'queueFirst', 'priorityFirst'

    useEffect(() => {
        if (dToken) {
            getAppointments();
        }
    }, [dToken]);

    const handleAction = (action, appointmentId) => {
        setConfirmAction(action);
        setSelectedAppointmentId(appointmentId);
        setShowConfirmModal(true);
    };

    const confirmActionHandler = () => {
        if (confirmAction === 'cancel') {
            cancelAppointments(selectedAppointmentId);
        } else if (confirmAction === 'complete') {
            completeAppointments(selectedAppointmentId);
        }
        setShowConfirmModal(false);
        setConfirmAction(null);
        setSelectedAppointmentId(null);
    };

    // Function to parse slotDate from DD_M_YYYY to Date object
    const parseSlotDate = (slotDate) => {
        const [day, month, year] = slotDate.split('_').map(Number);
        return new Date(year, month - 1, day); // month is 0-based in JS
    };

    // Function to parse token for numerical comparison
    const parseToken = (token) => {
        if (!token) return Infinity; // Place appointments without tokens at the end
        const tokenNumber = parseInt(token.replace('#', ''), 10);
        return isNaN(tokenNumber) ? Infinity : tokenNumber;
    };

    // Filter and sort appointments
    const filteredAndSortedAppointments = appointments
        .filter(item =>
            item.userData.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'date') {
                const dateA = parseSlotDate(a.slotDate);
                const dateB = parseSlotDate(b.slotDate);
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else if (sortBy === 'bookingMode') {
                if (sortOrder === 'queueFirst') {
                    return a.bookingMode === 'queue' && b.bookingMode !== 'queue' ? -1 : a.bookingMode !== 'queue' && b.bookingMode === 'queue' ? 1 : 0;
                } else { // priorityFirst
                    return a.bookingMode === 'priority' && b.bookingMode !== 'priority' ? -1 : a.bookingMode !== 'priority' && b.bookingMode === 'priority' ? 1 : 0;
                }
            } else if (sortBy === 'token') {
                const tokenA = parseToken(a.token);
                const tokenB = parseToken(b.token);
                return sortOrder === 'asc' ? tokenA - tokenB : tokenB - tokenA; // Support both ascending and descending
            }
            return 0;
        });

    return (
        <div className="w-full max-w-6xl m-5">
            <p className="mb-3 text-lg font-medium">All Appointments</p>

            {/* Search and Sort Controls */}
            <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by patient name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-600">Sort by:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            // Reset sortOrder to a default value based on the new sortBy
                            if (e.target.value === 'date') setSortOrder('desc');
                            else if (e.target.value === 'bookingMode') setSortOrder('queueFirst');
                            else if (e.target.value === 'token') setSortOrder('asc');
                        }}
                        className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="date">Date</option>
                        <option value="bookingMode">Booking Mode</option>
                        <option value="token">Token Number</option>
                    </select>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {sortBy === 'date' && (
                            <>
                                <option value="desc">Newest First</option>
                                <option value="asc">Oldest First</option>
                            </>
                        )}
                        {sortBy === 'bookingMode' && (
                            <>
                                <option value="queueFirst">Queue First</option>
                                <option value="priorityFirst">Priority First</option>
                            </>
                        )}
                        {sortBy === 'token' && (
                            <>
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </>
                        )}
                    </select>
                </div>
            </div>

            <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll">
                <div className="grid grid-cols-[200px_100px_100px_100px_100px_200px_100px_120px] sm:grid-cols-[200px_100px_100px_100px_100px_200px_100px_120px] items-center py-3 px-4 border-b bg-gray-50 text-sm font-medium text-gray-600">
                    <p>Patient</p>
                    <p>Age</p>
                    <p>Mode</p>
                    <p>Type</p>
                    <p>Token</p>
                    <p>Date & Time</p>
                    <p>Status</p>
                    <p>Action</p>
                </div>

                {filteredAndSortedAppointments.length === 0 ? (
                    <div className="py-6 px-4 text-center text-gray-500 text-sm">
                        No appointments found
                    </div>
                ) : (
                    filteredAndSortedAppointments.map((item, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-[200px_100px_100px_100px_100px_200px_100px_120px] sm:grid-cols-[200px_100px_100px_100px_100px_200px_100px_120px] items-center py-3 px-4 border-b text-sm text-gray-600 hover:bg-gray-100"
                        >
                            <div className="flex items-center gap-2">
                                <img className="rounded-full w-10 h-10 object-cover" src={item.userData.image} alt="" />
                                <div>
                                    <p className="text-gray-800 font-medium whitespace-nowrap">{item.userData.name}</p>
                                </div>
                            </div>
                            <p>{calculateAge(item.userData.dob)}</p>
                            <div>
                                {item.appointmentType === "online" ? (
                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-100 rounded-full">
                                        Online
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                                        Offline
                                    </span>
                                )}
                            </div>
                            <div>
                                {item.bookingMode === "priority" ? (
                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                                        Priority
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                                        Queue
                                    </span>
                                )}
                            </div>
                            <div>
                                {item.bookingMode === "queue" && item.token ? (
                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                                        {item.token}
                                    </span>
                                ) : (
                                    <span>-</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
                                {item.rescheduled && (
                                    <span className="text-[10px] bg-green-200 text-green-800 px-2 py-[2px] rounded-full font-semibold">
                                        Updated
                                    </span>
                                )}
                            </div>
                            <div>
                                {item.cancelled ? (
                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                                        Cancelled
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
                            </div>
                            <div className="flex gap-2">
                                {!item.cancelled && !item.isCompleted && (
                                    <>
                                        <button
                                            onClick={() => handleAction('cancel', item._id)}
                                            className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleAction('complete', item._id)}
                                            className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded hover:bg-green-600 transition"
                                        >
                                            Complete
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => setSelectedAppointment(item)}
                                    className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition"
                                >
                                    Details
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                            Confirm {confirmAction === 'cancel' ? 'Cancellation' : 'Completion'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to {confirmAction === 'cancel' ? 'cancel' : 'complete'} this appointment?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                            >
                                No
                            </button>
                            <button
                                onClick={confirmActionHandler}
                                className={`px-4 py-2 text-white rounded transition ${confirmAction === 'cancel'
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-green-500 hover:bg-green-600'
                                    }`}
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Appointment Details</h3>
                        <div className="text-sm text-gray-600 space-y-3">
                            <p>
                                <span className="font-medium">Patient Name:</span> {selectedAppointment.userData.name}
                            </p>
                            <p>
                                <span className="font-medium">Age:</span> {calculateAge(selectedAppointment.userData.dob)}
                            </p>
                            <p>
                                <span className="font-medium">Mode:</span>{' '}
                                {selectedAppointment.appointmentType === "online" ? 'Online' : 'Offline'}
                            </p>
                            <p>
                                <span className="font-medium">Type:</span>{' '}
                                {selectedAppointment.bookingMode === "priority" ? 'Priority' : 'Queue'}
                            </p>
                            <p>
                                <span className="font-medium">Date & Time:</span>{' '}
                                {slotDateFormat(selectedAppointment.slotDate)}, {selectedAppointment.slotTime}
                            </p>
                            <p>
                                <span className="font-medium">Fees:</span> {currency}{selectedAppointment.amount}
                            </p>
                            <p>
                                <span className="font-medium">Description:</span>{' '}
                                {selectedAppointment.description || 'No description provided.'}
                            </p>
                            <p>
                                <span className="font-medium">Attachment:</span>{' '}
                                {selectedAppointment.attachmentUrl ? (
                                    <a
                                        href={selectedAppointment.attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        View Report 📎
                                    </a>
                                ) : (
                                    'Not provided'
                                )}
                            </p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedAppointment(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorAppointment;