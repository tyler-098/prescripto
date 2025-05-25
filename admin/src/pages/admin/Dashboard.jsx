import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { assets1 } from '../../assets/assets1';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const { aToken, getDashData, dashData } = useContext(AdminContext);
    const { slotDateFormat, calculateAge } = useContext(AppContext);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    useEffect(() => {
        if (aToken) {
            getDashData(); // Initial fetch
            const intervalId = setInterval(() => {
                getDashData(); // Poll every 30 seconds
            }, 30000);

            // Cleanup interval on unmount
            return () => clearInterval(intervalId);
        }
    }, [aToken]);

    const openDetailsModal = (appointment) => {
        setSelectedAppointment(appointment);
        setShowDetailsModal(true);
    };

    // Calculate offline and online appointments based on appointmentType using latestAppointments (temporary)
    const offlineAppointments = dashData?.latestAppointments?.filter(app => app.appointmentType === "walk-in").length || 0;
    const onlineAppointments = dashData?.latestAppointments?.filter(app => app.appointmentType === "online").length || 0;

    return dashData ? (
        <div className="m-5">
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
                    <img className="w-14" src={assets1.doctor_icon} alt="" />
                    <div>
                        <p className="text-xl font-semibold text-gray-600">{dashData.doctors}</p>
                        <p className="text-gray-600">Doctors</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
                    <img className="w-14" src={assets1.appointments_icon} alt="" />
                    <div>
                        <p className="text-xl font-semibold text-gray-600">{dashData.appointments}</p>
                        <p className="text-gray-600">Appointments</p>
                        <div className="mt-1 text-xs text-gray-500">
                            <p>Offline: {offlineAppointments}</p>
                            <p>Online: {onlineAppointments}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white mt-10 rounded border">
                <div className="flex items-center gap-2.5 px-4 py-4 rounded-t border-b">
                    <img src={assets1.list_icon} alt="" />
                    <p className="font-semibold text-gray-800">Latest Bookings</p>
                </div>

                <div className="overflow-x-auto">
                    <div className="grid grid-cols-[120px_2fr_120px_120px_80px] sm:grid-cols-[120px_2fr_120px_120px_80px] items-center py-3 px-4 border-b bg-gray-50 text-sm font-medium text-gray-600">
                        <p>Mode</p>
                        <p>Doctor</p>
                        <p>Type</p>
                        <p>Status</p>
                        <p>Details</p>
                    </div>

                    {dashData.latestAppointments.length === 0 ? (
                        <div className="py-6 px-4 text-center text-gray-500 text-sm">
                            No recent bookings
                        </div>
                    ) : (
                        dashData.latestAppointments.slice(0, 5).map((item) => (
                            <div
                                className="grid grid-cols-[120px_2fr_120px_120px_80px] sm:grid-cols-[120px_2fr_120px_120px_80px] items-center py-3 px-4 border-b text-sm text-gray-600 hover:bg-gray-100"
                                key={item._id}
                            >
                                <div>
                                    {item.bookingMode === 'priority' ? (
                                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                                            Priority
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                                            Queue
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <img className="rounded-full w-10 h-10 object-cover" src={item.docData.image} alt="" />
                                    <div>
                                        <p className="text-gray-800 font-medium">{item.docData.name}</p>
                                        <p className="text-gray-600">
                                            {slotDateFormat(item.slotDate)}, {item.slotTime}
                                        </p>
                                    </div>
                                </div>
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
                                <div>
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
            </div>

            {/* Patient Details Modal */}
            {showDetailsModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Appointment Details</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                            <p>
                                <span className="font-medium">Patient Name:</span> {selectedAppointment.userData?.name || 'Not available'}
                            </p>
                            <p>
                                <span className="font-medium">Age:</span> {selectedAppointment.userData?.dob ? calculateAge(selectedAppointment.userData.dob) : 'Not available'}
                            </p>
                            <p>
                                <span className="font-medium">Gender:</span> {selectedAppointment.userData?.gender || 'Not available'}
                            </p>
                            <p>
                                <span className="font-medium">Mode:</span>{' '}
                                {selectedAppointment.bookingMode === 'priority' ? 'Priority' : 'Queue'}
                            </p>
                            <p>
                                <span className="font-medium">Type:</span>{' '}
                                {selectedAppointment.appointmentType === "online" ? 'Online' : 'Offline'}
                            </p>
                            <p>
                                <span className="font-medium">Doctor:</span> {selectedAppointment.docData.name}
                            </p>
                            <p>
                                <span className="font-medium">Date & Time:</span>{' '}
                                {slotDateFormat(selectedAppointment.slotDate)}, {selectedAppointment.slotTime}
                            </p>
                            <p>
                                <span className="font-medium">Description:</span>{' '}
                                {selectedAppointment.description || 'Not provided'}
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
                                        View Document
                                    </a>
                                ) : (
                                    'Not provided'
                                )}
                            </p>
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
        </div>
    ) : null;
};

export default Dashboard;