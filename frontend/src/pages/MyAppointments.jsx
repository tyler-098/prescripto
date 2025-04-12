import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext)

  const [appointments, setAppointments] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState({ date: '', time: '' })
  const [selectedDate, setSelectedDate] = useState('');


  const months = ['', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_')
    return dateArray[0] + ' ' + months[Number(dateArray[1])] + ' ' + dateArray[2]
  }

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
      if (data.success) {
        setAppointments(data.appointments.reverse())
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const openRescheduleModal = async (appointment) => {
    setSelectedAppointment(appointment)
    setShowModal(true)

    try {
      console.log('doctorId:', appointment.docData._id)
      const { data } = await axios.post(`${backendUrl}/api/user/get-available-slots`, {
        doctorId: appointment.docData._id
      }, { headers: { token } })

      if (data.success) {
        setAvailableSlots(data.availableSlots)

      } else {
        toast.error('Failed to fetch slots')
        console.log("Slot fetch error:", error);
        toast.error(error.response?.data?.message || error.message)

      }
    } catch (error) {
      toast.error(error.message)

    }
  }

  const confirmReschedule = async () => {
    if (!selectedSlot.date || !selectedSlot.time) {
      toast.error("Please select a slot")
      return
    }

    try {
      const { data } = await axios.post(`${backendUrl}/api/user/reschedule-appointment`, {
        appointmentId: selectedAppointment._id,
        newSlotDate: selectedSlot.date,
        newSlotTime: selectedSlot.time
      }, { headers: { token } })

      if (data.success) {
        toast.success("Appointment Rescheduled")
        setShowModal(false)
        setSelectedSlot({ date: '', time: '' })
        getUserAppointments()
        getDoctorsData()
        console.log("Reschedule response:", data.appointment);


      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My appointments</p>
      <div>
        {appointments.map((item, index) => (
          <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
            <div><img className='w-32 bg-indigo-50' src={item.docData.image} alt="" /></div>
            <div className='flex-1 text-sm text-zinc-600'>
              <p className='text-netural-800 font-semibold'>{item.docData.name}</p>
              <p>{item.docData.speciality}</p>

              <p className='text-zinc-700 font-medium mt-1'>Address:</p>
              <p className='text-xs'>{item.docData.address}</p>

              <p className='text-xs mt-1'>
                <span className='text-sm font-medium text-zinc-700'>Date & Time: </span>
                {item.rescheduled ? (
                  <span className="inline-block bg-green-50 border border-green-200 text-green-700 rounded-xl px-3 py-1">
                    {slotDateFormat(item.slotDate)} | {item.slotTime}
                    <span className="ml-2 text-[10px] bg-green-200 text-green-800 px-2 py-[2px] rounded-full font-semibold">
                      Updated
                    </span>
                  </span>
                ) : (
                  `${slotDateFormat(item.slotDate)} | ${item.slotTime}`
                )}
              </p>
            </div>


            <div className='flex flex-col gap-3 justify-end'>
              {!item.cancelled && !item.isCompleted && (
                <>
                  <button className='text-sm text-stone-600 border border-stone-300 rounded-xl px-4 py-2 hover:bg-primary hover:text-white transition-all duration-200 w-full sm:w-48'>
                    Pay Online
                  </button>
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    className='text-sm text-stone-600 border border-stone-300 rounded-xl px-4 py-2 hover:bg-red-500 hover:text-white transition-all duration-200 w-full sm:w-48'
                  >
                    Cancel
                  </button>

                  {item.rescheduled ? (
                    <div className='text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-center w-full sm:w-48'>
                      Rescheduled
                    </div>
                  ) : (
                    <button
                      onClick={() => openRescheduleModal(item)}
                      className='text-sm text-stone-600 border border-stone-300 rounded-xl px-4 py-2 hover:bg-primary hover:text-white transition-all duration-200 w-full sm:w-48'
                    >
                      Reschedule
                    </button>
                  )}
                </>
              )}


              {item.cancelled && (
                <div className='text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center w-full sm:w-48'>
                  Cancelled
                </div>
              )}

              {item.isCompleted && (
                <span className='text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-center w-full sm:w-48'>
                  Completed
                </span>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Reschedule Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50'>
          <div className='bg-white p-6 rounded shadow w-96 max-h-[80vh] overflow-y-auto'>
            <h2 className='font-semibold text-lg mb-4'>Select New Slot</h2>


            {/* Select Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value) + 1}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="">-- Choose Date --</option>
                {availableSlots.map((slot, index) => (
                  <option key={index} value={slot.date}>
                    {slotDateFormat(slot.date)}
                  </option>
                ))}
              </select>
            </div>

            {/* Show Slots for Selected Date */}
            {selectedDate && (
              <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500 font-medium mb-3 border-b pb-1">
                  {slotDateFormat(selectedDate)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableSlots
                    .find(slot => slot.date === selectedDate)
                    ?.slots.map((timeSlot, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSlot({ date: selectedDate, time: timeSlot.time })}
                        className={`px-3 py-1.5 text-sm rounded-full border transition duration-200 ${selectedSlot.date === selectedDate && selectedSlot.time === timeSlot.time
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                          }`}
                      >
                        {timeSlot.time}
                      </button>
                    ))}
                </div>
              </div>
            )}




            <div className='flex justify-end gap-2 mt-4'>
              <button onClick={() => setShowModal(false)} className='px-4 py-2 border rounded'>Cancel</button>
              <button onClick={confirmReschedule} className='px-4 py-2 bg-primary text-white rounded'>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAppointments
