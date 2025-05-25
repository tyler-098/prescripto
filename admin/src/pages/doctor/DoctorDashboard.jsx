import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { assets1 } from '../../assets/assets1';

const DoctorDashboard = () => {
    const { dToken, dashData, setDashData, getDashData, completeAppointments, cancelAppointments } = useContext(DoctorContext);
    const { currency, slotDateFormat } = useContext(AppContext);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

    useEffect(() => {
        if (dToken) {
            getDashData();
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

    // Calculate offline and online appointments based on appointmentType using latestAppointments (temporary)
    const offlineAppointments = dashData?.latestAppointments?.filter(app => app.appointmentType === "walk-in").length || 0;
    const onlineAppointments = dashData?.latestAppointments?.filter(app => app.appointmentType === "online").length || 0;

    return dashData ? (
        <div className="m-5">
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
                    <img className="w-14" src={assets1.earning_icon} alt="" />
                    <div>
                        <p className="text-xl font-semibold text-gray-600">{currency}{dashData.earnings}</p>
                        <p className="text-gray-600">Earnings</p>
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

                <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
                    <img className="w-14" src={assets1.patients_icon} alt="" />
                    <div>
                        <p className="text-xl font-semibold text-gray-600">{dashData.patients}</p>
                        <p className="text-gray-600">Patients</p>
                    </div>
                </div>
            </div>

            <div className="bg-white mt-10 rounded border">
                <div className="flex items-center gap-2.5 px-4 py-4 rounded-t border-b">
                    <img src={assets1.list_icon} alt="" />
                    <p className="font-semibold text-gray-800">Latest Bookings</p>
                </div>

                <div className="overflow-x-auto">
                    <div className="grid grid-cols-[200px_1fr_100px_100px_120px] sm:grid-cols-[200px_1fr_100px_100px_120px] items-center py-3 px-4 border-b bg-gray-50 text-sm font-medium text-gray-600">
                        <p>Patient</p>
                        <p>Mode</p>
                        <p>Type</p>
                        <p>Status</p>
                        <p>Action</p>
                    </div>

                    {dashData.latestAppointments.length === 0 ? (
                        <div className="py-6 px-4 text-center text-gray-500 text-sm">
                            No recent bookings
                        </div>
                    ) : (
                        dashData.latestAppointments.map((item, index) => (
                            <div
                                className="grid grid-cols-[200px_1fr_100px_100px_120px] sm:grid-cols-[200px_1fr_100px_100px_120px] items-center py-3 px-4 border-b text-sm text-gray-600 hover:bg-gray-100"
                                key={item._id || index}
                            >
                                <div className="flex items-center gap-2">
                                    <img className="rounded-full w-10 h-10 object-cover" src={item.userData.image} alt="" />
                                    <div>
                                        <p className="text-gray-800 font-medium whitespace-nowrap">{item.userData.name}</p>
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
                                </div>
                            </div>
                        ))
                    )}
                </div>
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
        </div>
    ) : null;
};

export default DoctorDashboard;