import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const AddPatient = () => {
    const { aToken, getAllDoctors, doctors, getQueuePosition, addPatient } = useContext(AdminContext);
    const { calculateAge } = useContext(AppContext);

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        mobile: '',
        email: '',
        description: '',
        doctorId: '',
        slotTime: '',
        slotDate: '',
        payment: false,
    });
    const [queuePosition, setQueuePosition] = useState(null);
    const [tokenNumber, setTokenNumber] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [tomorrowSlots, setTomorrowSlots] = useState([]);
    const [showTomorrow, setShowTomorrow] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [appointmentDetails, setAppointmentDetails] = useState(null);
    const [doctorFees, setDoctorFees] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const initializeDateAndSlots = () => {
            const now = new Date();
            const today = now.toISOString().split('T')[0];

            setFormData(prev => ({
                ...prev,
                slotDate: today,
                slotTime: '',
            }));

            setShowTomorrow(false);
        };

        if (aToken) {
            getAllDoctors();
            initializeDateAndSlots();
        }
    }, [aToken]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
        else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Mobile number must be 10 digits';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.doctorId) newErrors.doctorId = 'Please select a doctor';
        if (!formData.slotTime) newErrors.slotTime = 'Please select a time slot';
        if (formData.age && (isNaN(formData.age) || formData.age < 0 || formData.age > 120)) {
            newErrors.age = 'Age must be between 0 and 120';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getSlotNumber = (slotTime) => {
        const slotMapping = {
            "10:00 AM": "01",
            "12:00 PM": "02",
            "03:00 PM": "03",
            "05:00 PM": "04",
        };
        return slotMapping[slotTime] || "00";
    };

    const calculateTokenNumber = (slotDate, slotTime, queuePos) => {
        const date = new Date(slotDate);
        const day = date.getDate().toString().padStart(2, '0');
        const slotNumber = getSlotNumber(slotTime);
        const queuePositionStr = queuePos.toString().padStart(2, '0');
        return `${day}${slotNumber}${queuePositionStr}`;
    };

    const handleDoctorChange = async (e) => {
        const docId = e.target.value;
        setFormData({ ...formData, doctorId: docId, slotTime: '' });
        setErrors({ ...errors, slotTime: null });

        if (docId) {
            const doctor = doctors.find(doc => doc._id === docId);
            if (doctor) {
                setDoctorFees(doctor.fees);
            }

            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            const tomorrowDate = tomorrow.toISOString().split('T')[0];

            const { queuePosition, availableSlots, tomorrowSlots } = await getQueuePosition(docId);
            setAvailableSlots(availableSlots);
            setTomorrowSlots(tomorrowSlots);

            const relevantTodaySlots = getRelevantSlots(false);
            if (relevantTodaySlots.length > 0) {
                setShowTomorrow(false);
                const defaultSlot = relevantTodaySlots[0];
                setFormData(prev => ({
                    ...prev,
                    slotTime: defaultSlot.start,
                    slotDate: today,
                }));
                const { queuePosition: slotQueuePosition } = await getQueuePosition(docId, defaultSlot.start);
                setQueuePosition(slotQueuePosition);
            } else {
                setShowTomorrow(true);
                setFormData(prev => ({
                    ...prev,
                    slotTime: tomorrowSlots.length > 0 ? tomorrowSlots[0].start : '',
                    slotDate: tomorrowDate,
                }));
                setQueuePosition(null);
            }
            setTokenNumber(null);
        } else {
            setQueuePosition(null);
            setTokenNumber(null);
            setAvailableSlots([]);
            setTomorrowSlots([]);
            setDoctorFees(null);
            setShowTomorrow(false);
        }
    };

    const handleSlotSelect = async (slot, date) => {
        setFormData({ ...formData, slotTime: slot.start, slotDate: date });
        setErrors({ ...errors, slotTime: null });

        if (formData.doctorId) {
            const { queuePosition } = await getQueuePosition(formData.doctorId, slot.start);
            setQueuePosition(queuePosition);
            setTokenNumber(null);
        }
    };

    const toggleTomorrow = () => {
        setShowTomorrow(!showTomorrow);
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split('T')[0];

        const newDate = showTomorrow ? today : tomorrowDate;
        const relevantSlotsForDate = showTomorrow ? getRelevantSlots(false) : tomorrowSlots;
        const newSlotTime = relevantSlotsForDate.length > 0 ? relevantSlotsForDate[0].start : '';

        setFormData({ ...formData, slotTime: newSlotTime, slotDate: newDate });
        setErrors({ ...errors, slotTime: null });

        if (!showTomorrow && formData.doctorId && newSlotTime) {
            getQueuePosition(formData.doctorId, newSlotTime).then(({ queuePosition }) => {
                setQueuePosition(queuePosition);
                setTokenNumber(null);
            });
        } else {
            setQueuePosition(null);
            setTokenNumber(null);
        }
    };

    const handlePaymentChange = (e) => {
        setFormData(prev => ({ ...prev, payment: e.target.checked }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form data on submit:', formData);
        if (!validateForm()) return;

        const patientData = {
            ...formData,
            age: formData.age ? parseInt(formData.age) : null,
        };
        const appointment = await addPatient(patientData);
        if (appointment) {
            const token = calculateTokenNumber(formData.slotDate, formData.slotTime, queuePosition);
            setTokenNumber(token);
            setAppointmentDetails({ ...appointment, tokenNumber: token });
            setShowConfirmModal(true);
            setFormData({
                name: '',
                age: '',
                gender: '',
                mobile: '',
                email: '',
                description: '',
                doctorId: '',
                slotTime: '',
                slotDate: new Date().toISOString().split('T')[0],
                payment: false,
            });
            setQueuePosition(null);
            setAvailableSlots([]);
            setTomorrowSlots([]);
            setShowTomorrow(false);
            setDoctorFees(null);
        }
    };

    const getQueueColor = (position) => {
        if (position < 7) return 'bg-green-100 text-green-800';
        if (position <= 15) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    const getRelevantSlots = (forceTomorrow = false) => {
        const defaultSlots = [
            { start: "10:00 AM", end: "12:00 PM", display: "10:00 AM - 12:00 PM" },
            { start: "12:00 PM", end: "02:00 PM", display: "12:00 PM - 2:00 PM" },
            { start: "03:00 PM", end: "05:00 PM", display: "3:00 PM - 5:00 PM" },
            { start: "05:00 PM", end: "07:00 PM", display: "5:00 PM - 7:00 PM" },
        ];

        const slots = forceTomorrow ? tomorrowSlots : availableSlots;
        const slotsToFilter = slots.length === 0 ? defaultSlots : slots;

        // Get current time in IST using toLocaleString
        const now = new Date();
        const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const currentHours = istTime.getHours();
        const currentMinutes = istTime.getMinutes();
        const currentTimeInMinutes = currentHours * 60 + currentMinutes;

        console.log('Current IST Time:', istTime.toISOString(), 'Hours:', currentHours, 'Minutes:', currentMinutes, 'Total Minutes:', currentTimeInMinutes);

        if (forceTomorrow) {
            return slotsToFilter.slice(0, 1); // Show first available tomorrow slot
        }

        // Collect all slots that are still active or upcoming
        const relevantSlots = slotsToFilter.filter((slot) => {
            const [startHoursStr, startMinutesStr, startPeriod] = slot.start.match(/(\d+):(\d+)\s*(AM|PM)/i).slice(1);
            const [endHoursStr, endMinutesStr, endPeriod] = slot.end.match(/(\d+):(\d+)\s*(AM|PM)/i).slice(1);
            let startHours = parseInt(startHoursStr);
            let startMinutes = parseInt(startMinutesStr) || 0;
            let endHours = parseInt(endHoursStr);
            let endMinutes = parseInt(endMinutesStr) || 0;

            if (startPeriod.toUpperCase() === 'PM' && startHours !== 12) startHours += 12;
            if (startPeriod.toUpperCase() === 'AM' && startHours === 12) startHours = 0;
            if (endPeriod.toUpperCase() === 'PM' && endHours !== 12) endHours += 12;
            if (endPeriod.toUpperCase() === 'AM' && endHours === 12) endHours = 0;

            const startTimeInMinutes = startHours * 60 + startMinutes;
            const endTimeInMinutes = endHours * 60 + endMinutes;

            console.log(`Slot: ${slot.display}, Start: ${startTimeInMinutes}, End: ${endTimeInMinutes}, Current: ${currentTimeInMinutes}, Included: ${endTimeInMinutes >= currentTimeInMinutes}`);

            // Include slots where the end time is after the current time
            return endTimeInMinutes >= currentTimeInMinutes;
        });

        // Limit to the first two slots (current and next)
        return relevantSlots.slice(0, 2);
    };

    const relevantSlots = getRelevantSlots(showTomorrow);
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Add Walk-In Patient</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Enter patient name"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Enter age"
                                min="0"
                                max="120"
                            />
                            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                            <input
                                type="text"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.mobile ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Enter mobile number"
                            />
                            {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Enter email address"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
                            <select
                                value={formData.doctorId}
                                onChange={handleDoctorChange}
                                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white ${errors.doctorId ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Select a doctor</option>
                                {doctors.map((doctor) => (
                                    <option key={doctor._id} value={doctor._id}>
                                        {doctor.name} ({doctor.speciality})
                                    </option>
                                ))}
                            </select>
                            {errors.doctorId && <p className="text-red-500 text-xs mt-1">{errors.doctorId}</p>}
                        </div>
                    </div>

                    {formData.doctorId && doctorFees !== null && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Fees</label>
                            <p className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-gray-100">
                                ₹{doctorFees}
                            </p>
                        </div>
                    )}

                    {formData.doctorId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mark as Paid</label>
                            <input
                                type="checkbox"
                                checked={formData.payment}
                                onChange={handlePaymentChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                        </div>
                    )}

                    {formData.doctorId && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    {showTomorrow ? 'Tomorrow’s Available Time Slot *' : 'Available Time Slot *'}
                                </label>
                                {(availableSlots.length > 0 || tomorrowSlots.length > 0) && (
                                    <button
                                        type="button"
                                        onClick={toggleTomorrow}
                                        className="text-blue-600 text-sm hover:underline"
                                    >
                                        {showTomorrow ? 'View Today’s Slots' : 'View Tomorrow’s Slots'}
                                    </button>
                                )}
                            </div>
                            {relevantSlots.length > 0 ? (
                                <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                                    {relevantSlots.map((slot) => (
                                        <button
                                            key={slot.start}
                                            type="button"
                                            onClick={() => handleSlotSelect(slot, showTomorrow ? tomorrow : today)}
                                            className={`px-6 py-3 rounded-lg text-sm font-medium transition shadow-sm ${formData.slotTime === slot.start && formData.slotDate === (showTomorrow ? tomorrow : today)
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                }`}
                                        >
                                            {slot.display}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-red-500 text-sm mt-2">
                                    {showTomorrow ? 'No slots available tomorrow.' : 'No slots available today.'}
                                </p>
                            )}
                            {errors.slotTime && <p className="text-red-500 text-xs mt-2">{errors.slotTime}</p>}
                        </div>
                    )}

                    {queuePosition !== null && !showTomorrow && (
                        <div className={`mt-4 p-4 rounded-lg text-sm ${getQueueColor(queuePosition)}`}>
                            <p>
                                <span className="font-medium">Queue Position for {formData.slotTime}:</span> {queuePosition}
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            rows="4"
                            placeholder="Enter description"
                        />
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                        >
                            Add Patient
                        </button>
                    </div>
                </form>
            </div>

            {showConfirmModal && appointmentDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Appointment Confirmed</h3>
                        <div className="space-y-4 text-sm text-gray-600">
                            <p>
                                <span className="font-medium">Appointment ID:</span> {appointmentDetails._id}
                            </p>
                            <p>
                                <span className="font-medium">Patient Name:</span> {appointmentDetails.patientName}
                            </p>
                            <p>
                                <span className="font-medium">Mobile:</span> {appointmentDetails.mobile}
                            </p>
                            <p>
                                <span className="font-medium">Doctor:</span> {appointmentDetails.docData.name}
                            </p>
                            <p>
                                <span className="font-medium">Fees:</span> ₹{appointmentDetails.amount}
                            </p>
                            <p>
                                <span className="font-medium">Payment Status:</span> {appointmentDetails.payment ? 'Paid' : 'Not Paid'}
                            </p>
                            <p>
                                <span className="font-medium">Token Number:</span> {appointmentDetails.tokenNumber}
                            </p>
                            <p>
                                <span className="font-medium">Time:</span> {appointmentDetails.slotTime}
                            </p>
                            <p>
                                <span className="font-medium">Date:</span> {appointmentDetails.slotDate}
                            </p>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
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

export default AddPatient;