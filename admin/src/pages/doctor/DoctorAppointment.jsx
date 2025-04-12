import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets1 } from '../../assets/assets1'

const DoctorAppointment = () => {
    const { dToken, appointments, getAppointments, completeAppointments, cancelAppointments } = useContext(DoctorContext)
    const { calculateAge, slotDateFormat, currency } = useContext(AppContext)

    const [selectedAppointment, setSelectedAppointment] = useState(null)

    useEffect(() => {
        if (dToken) {
            getAppointments()
        }
    }, [dToken])

    return (
        <div className='w-full max-w-6xl m-5'>
            <p className='mb-3 text-lg font-medium'>All Appointments</p>

            <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll'>
                <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b'>
                    <p>#</p>
                    <p>Patient</p>
                    <p>Payment</p>
                    <p>Age</p>
                    <p>Date & Time</p>
                    <p>Fees</p>
                    <p>Action</p>
                </div>

                {appointments.slice().reverse().map((item, index) => (
                    <div key={index} className='flex flex-wrap justify-between max-sm:gap-5 sm:grid sm:grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-100'>
                        <p className='max-sm:hidden'>{index + 1}</p>

                        <div className='flex items-center gap-2'>
                            <img className='w-8 rounded-full' src={item.userData.image} alt="" />
                            <p>{item.userData.name}</p>
                        </div>

                        <div>
                            <p className='text-xs inline border border-primary px-2 rounded-full'>
                                {item.payment ? 'Online' : 'Cash'}
                            </p>
                        </div>

                        <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>

                        {/* Conditionally render the updated date/time */}
                        <div className="flex items-center gap-2">
                            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
                            {item.rescheduled && (
                                <span className="ml-2 text-[10px] bg-green-200 text-green-800 px-2 py-[2px] rounded-full font-semibold">
                                    Updated
                                </span>
                            )}
                        </div>

                        <p>{currency}{item.amount}</p>

                        <div className='flex flex-col gap-1'>
                            {
                                item.cancelled
                                    ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                                    : item.isCompleted
                                        ? <p className='text-green-500 text-xs font-medium'>Completed</p>
                                        : <div className='flex gap-2'>
                                            <img onClick={() => cancelAppointments(item._id)} className='w-6 cursor-pointer' src={assets1.cancel_icon} alt="" />
                                            <img onClick={() => completeAppointments(item._id)} className='w-6 cursor-pointer' src={assets1.tick_icon} alt="" />
                                        </div>
                            }

                            <div className="flex justify-start pl-2">
                                <button
                                    onClick={() => setSelectedAppointment(item)}
                                    className="text-blue-500 text-xs underline hover:text-blue-700 mt-1"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}



            </div>

            {/* Modal */}
            {selectedAppointment && (
                <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
                    <div className='bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg'>
                        <h3 className='text-lg font-semibold mb-4'>Appointment Details</h3>
                        <div className='text-sm space-y-2'>

                            <p><strong>Description:</strong> {selectedAppointment.description || 'No description provided.'}</p>
                            <div className="flex items-center gap-2">
                                <strong>Attachment:</strong>
                                <a
                                    href={selectedAppointment.attachmentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline hover:text-blue-800"
                                >
                                    View Report 📎
                                </a>

                            </div>


                        </div>
                        <div className='text-right mt-4'>
                            <button
                                onClick={() => setSelectedAppointment(null)}
                                className='px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm'
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DoctorAppointment
