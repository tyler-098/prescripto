import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets1 } from '../assets/assets1';
import RelatedDoctors from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

const Appointments = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [problem, setProblem] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [severity, setSeverity] = useState('');
  const [bookingMode, setBookingMode] = useState('queue');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotCache, setSlotCache] = useState({});

  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
  };

  const fetchQueuePosition = async (docId, slotStart) => {
    try {
      if (!token) {
        console.warn('No token found, redirecting to login');
        toast.warn('Login to fetch queue position');
        navigate('/login');
        return { available: 0, position: 15, error: 'Login required' };
      }

      const slotDate = dayjs(slotStart).format('D_M_YYYY');
      const slotTime = dayjs(slotStart).format('hh:mm a').toLowerCase();

      console.log('Fetching queue position:', { docId, slotDate, slotTime });

      const response = await axios.post(
        `${backendUrl}/api/user/get-queue-position`,
        null,
        {
          headers: { token },
          params: { docId, slotDate, slotTime },
        }
      );

      console.log('Queue position response:', response.data);

      if (response.data.success) {
        return {
          available: 15 - response.data.queuePosition,
          position: response.data.queuePosition,
        };
      } else {
        console.error('Queue API error:', response.data.message);
        return { available: 0, position: 15, error: response.data.message };
      }
    } catch (error) {
      console.error('Queue API error:', error.message, error.response?.data);
      return { available: 0, position: 15, error: error.response?.data?.message || 'Failed to fetch queue position' };
    }
  };

  const getAvailableSlots = async () => {
    setIsLoadingSlots(true);

    if (!docInfo) {
      setIsLoadingSlots(false);
      return;
    }

    let today = new Date();

    if (bookingMode === 'queue') {
      const newSlots = [];
      for (let i = 0; i < 7; i++) {
        let currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        let slots = [];
        const slotHours = [10, 12, 15, 17];

        for (let hour of slotHours) {
          let slotStart = new Date(currentDate);
          slotStart.setHours(hour, 0, 0, 0);
          let slotEnd = new Date(slotStart);
          slotEnd.setHours(hour + 2, 0, 0, 0);

          if (today.getDate() === currentDate.getDate() && slotStart < today) {
            continue;
          }

          const { available, position, error } = await fetchQueuePosition(docInfo._id, slotStart);

          console.log("Queue slot built:", {
            datetime: slotStart,
            position: position,
            available: available,
            error
          });
          slots.push({
            datetime: slotStart,
            endTime: slotEnd,
            available,
            position,
            error
          });
        }

        if (slots.length > 0) {
          newSlots.push(slots);
        }
      }
      setDocSlots(newSlots);
      setIsLoadingSlots(false);
    } else {
      try {
        const cacheKey = `${docId}_${slotIndex}`;
        if (slotCache[cacheKey]) {
          console.log('Using cached slots:', cacheKey);
          setDocSlots(slotCache[cacheKey]);
          setIsLoadingSlots(false);
          return;
        }

        const response = await axios.post(
          `${backendUrl}/api/user/get-available-slots`,
          { doctorId: docId },
          { headers: { token } }
        );

        console.log('getAvailableSlots response:', JSON.stringify(response.data, null, 2));

        if (!response.data.success) {
          console.error('getAvailableSlots failed:', response.data.message);
          toast.error(response.data.message);
          setIsLoadingSlots(false);
          return;
        }

        const availableSlots = response.data.availableSlots.map(slot => ({
          ...slot,
          isBooked: slot.isBooked
        }));
        console.log('Processed slots with isBooked:', availableSlots);

        const slotsByDate = {};
        availableSlots.forEach(slot => {
          const date = slot.date;
          console.log('Processing slot:', { date, time: slot.time, isBooked: slot.isBooked });
          if (!slotsByDate[date]) {
            slotsByDate[date] = [];
          }
          const datetimeStr = `${date} ${slot.time}`;
          const parsedDate = dayjs.utc(datetimeStr, 'DD_M_YYYY hh:mm a');
          if (!parsedDate.isValid()) {
            console.error('Invalid date parse:', { datetimeStr, date, time: slot.time });
            return;
          }
          console.log('Parsed datetime:', parsedDate.toDate());
          slotsByDate[date].push({
            datetime: parsedDate.toDate(),
            time: slot.time.toLowerCase(),
            isBooked: slot.isBooked
          });
        });

        const sortedDates = Object.keys(slotsByDate).sort((a, b) => {
          const [dayA, monthA, yearA] = a.split('_').map(Number);
          const [dayB, monthB, yearB] = b.split('_').map(Number);
          return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
        });

        const formattedSlots = sortedDates.map(date => {
          const slots = slotsByDate[date].filter(slot => {
            if (today.getDate() === dayjs(date, 'DD_M_YYYY').date() && slot.datetime < today) {
              return false;
            }
            return true;
          });
          return slots.sort((a, b) => a.datetime - b.datetime);
        }).filter(slots => slots.length > 0);

        console.log('Formatted priority slots:', JSON.stringify(formattedSlots, null, 2));
        setDocSlots(formattedSlots);
        setSlotCache(prev => ({ ...prev, [cacheKey]: formattedSlots }));
        setIsLoadingSlots(false);
      } catch (error) {
        console.error('Error fetching available slots:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch available slots');
        setDocSlots([]);
        setIsLoadingSlots(false);
      }
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book Appointment');
      return navigate('/login');
    }

    if (!slotTime) {
      toast.error('Please select a slot');
      return;
    }

    try {
      const date = docSlots[slotIndex]?.[0]?.datetime;
      if (!date) {
        toast.error('Invalid slot selected');
        return;
      }

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      const slotDate = `${day}_${month}_${year}`;
      const normalizedSlotTime = slotTime.toLowerCase();

      const formData = new FormData();
      formData.append('docId', docId);
      formData.append('slotDate', slotDate);
      formData.append('slotTime', normalizedSlotTime);
      formData.append('bookingMode', bookingMode);
      formData.append('description', problem);
      formData.append('userId', '67ff4f46b8cf516e531b0553');
      if (attachment) {
        formData.append('attachment', attachment);
      }
      formData.append('severity', severity);

      console.log('Booking appointment:', { docId, slotDate, slotTime: normalizedSlotTime, bookingMode });

      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        formData,
        {
          headers: {
            token,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setSlotCache({});
        await getAvailableSlots();
        getDoctorsData();
        navigate('/myappointments');
      } else {
        console.error('Booking failed:', data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Booking error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (!token) {
      toast.warn('Login to cancel appointment');
      return navigate('/login');
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { userId: '67ff4f46b8cf516e531b0553', appointmentId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setSlotCache({}); // Clear cache to refresh slots
        await getAvailableSlots();
      } else {
        console.error('Cancellation failed:', response.data.message);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Cancellation error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) {
      setSlotCache({});
      getAvailableSlots();
    }
  }, [docInfo, bookingMode]);

  useEffect(() => {
    if (docInfo && bookingMode === 'priority') {
      console.log('slotIndex changed:', slotIndex);
      getAvailableSlots();
    }
  }, [slotIndex, docInfo, bookingMode]);

  return (
    docInfo && (
      <div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img className="bg-primary w-full sm:max-w-72 rounded-lg" src={docInfo.image} alt="" />
          </div>
          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo.name}
              <img className="w-4" src={assets1.verified_icon} alt="" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">{docInfo.experience}</button>
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-800 mt-3">
                About <img src={assets1.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">{docInfo.about}</p>
            </div>
            <p className="text-gray-600 font-medium mt-4">
              Appointment fee: <span className="text-gray-600">{currencySymbol}{docInfo.fees}</span>
              {bookingMode === 'priority' && (
                <span className="text-red-500"> + {currencySymbol}500 (Priority)</span>
              )}
            </p>
          </div>
        </div>

        <div className="sm:ml-72 sm:pl-4 mt-8 max-w-xl">
          <label className="block mb-1 text-sm font-medium text-gray-700">Choose Booking Type</label>
          <select
            value={bookingMode}
            onChange={(e) => {
              setBookingMode(e.target.value);
              setSlotIndex(0);
              setSlotTime('');
              setSlotCache({});
            }}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="queue">Queue-Based Appointment (No extra charge)</option>
            <option value="priority">Priority Appointment ({currencySymbol}500 Extra)</option>
          </select>
        </div>

        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>{bookingMode === 'queue' ? 'Queue Slots' : 'Booking Slots'}</p>
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
            {docSlots.length > 0 &&
              docSlots.map((item, index) => (
                item.length > 0 && item[0]?.datetime && (
                  <div
                    onClick={() => {
                      console.log('Selecting date index:', index);
                      setSlotIndex(index);
                      setSlotTime('');
                    }}
                    className={`text-center py-6 min-w-16 rounded-full cursor-pointer transition-all duration-300 ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200 hover:bg-gray-100'}`}
                    key={index}
                  >
                    <p>{daysOfWeek[item[0].datetime.getDay()]}</p>
                    <p>{item[0].datetime.getDate()}</p>
                  </div>
                )
              ))}
            {docSlots.length === 0 && !isLoadingSlots && (
              <p className="text-gray-500 mt-4">No slots available</p>
            )}
          </div>

          {bookingMode === 'queue' ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-1 gap-3">
              {docSlots[slotIndex]?.length > 0 ? (
                docSlots[slotIndex].map((slot, index) => {
                  const isFull = slot.available === 0;
                  const isHigh = slot.available <= 4;
                  const isMedium = slot.available <= 8 && slot.available > 4;
                  const isLow = slot.available > 8;

                  return (
                    slot.datetime && slot.endTime && (
                      <div
                        key={index}
                        onClick={() => !isFull && setSlotTime(dayjs(slot.datetime).format('hh:mm a').toLowerCase())}
                        className={`p-4 border rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105 max-w-xs ${isFull
                          ? 'bg-gray-200 border-gray-400 cursor-not-allowed'
                          : isHigh
                            ? 'border-red-500 bg-red-100'
                            : isMedium
                              ? 'border-yellow-500 bg-yellow-100'
                              : 'border-green-500 bg-green-100'
                          } ${slotTime === dayjs(slot.datetime).format('hh:mm a').toLowerCase() ? 'ring-2 ring-primary' : ''}`}
                      >
                        <p className="text-md font-semibold">
                          {slot.datetime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}{' '}
                          -{' '}
                          {slot.endTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </p>
                        {slot.error ? (
                          <p className="text-sm mt-1 text-red-500">{slot.error}</p>
                        ) : (
                          <>
                            <p className="text-sm mt-1">
                              {slot.position}/15 patients in queue
                            </p>
                            <p className="text-xs mt-1 text-gray-600">
                              {isFull
                                ? 'Queue Full'
                                : isHigh
                                  ? 'High Demand'
                                  : isMedium
                                    ? 'Moderate Demand'
                                    : 'Low Demand'}
                            </p>
                          </>
                        )}
                      </div>
                    )
                  );
                })
              ) : (
                <p className="text-gray-500 mt-4">No queue slots available for this day</p>
              )}
            </div>
          ) : (
            <div className={`mt-4 transition-opacity duration-300 ${isLoadingSlots ? 'opacity-50' : 'opacity-100'}`}>
              {isLoadingSlots ? (
                <p className="text-gray-500 mt-4 animate-pulse">Loading slots...</p>
              ) : docSlots[slotIndex]?.length > 0 ? (
                <div className="flex items-center gap-3 w-full overflow-x-scroll">
                  {docSlots[slotIndex].map((item, index) => (
                    item.time && item.datetime && (
                      <div
                        key={index}
                        onClick={() => !item.isBooked && setSlotTime(item.time)}
                        className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full text-center min-w-[100px] transition-all duration-200 ${item.isBooked
                          ? 'bg-red-100 border-red-500 text-red-700 cursor-not-allowed'
                          : item.time === slotTime
                            ? 'bg-primary text-white cursor-pointer'
                            : 'text emprendimiento-gray-400 border border-gray-300 cursor-pointer hover:bg-gray-100'
                          }`}
                      >
                        <p>{item.time}</p>
                        {item.isBooked && <p className="text-xs mt-1">Slot Booked</p>}
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mt-4">No priority slots available for this day</p>
              )}
            </div>
          )}

          <div className="mt-4 max-w-xl">
            <label className="block mb-1 text-sm font-medium text-gray-700">Describe your problem</label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={4}
              placeholder="E.g., Headache and fever for the past two days"
              className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4 max-w-xl">
            <label className="block mb-1 text-sm font-medium text-gray-700">Select your condition</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose severity</option>
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>

          <div className="mt-4 max-w-xl">
            <label className="block mb-1 text-sm font-small text-gray-600">Attach reports (optional)</label>
            <input
              type="file"
              onChange={(e) => setAttachment(e.target.files[0])}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <button
            onClick={bookAppointment}
            className="bg-primary text-white text-sm font-light px-10 py-3 rounded-full my-6"
          >
            Book Appointment
          </button>
        </div>

        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appointments;