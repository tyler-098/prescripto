import React, { useContext, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets1 } from '../assets/assets1'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast } from 'react-toastify'
import axios from 'axios'

const Appointments = () => {

  const { docId } = useParams()
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext)
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const navigate = useNavigate()

  const [docInfo, setDocInfo] = useState(null) // for thef
  const [docSlots, setDocSlots] = useState([]) // for choosing the doctor
  const [slotIndex, setSlotIndex] = useState(0) // for choosing slot date
  const [slotTime, setSlotTime] = useState('') // for choosing slot time
  const [problem, setProblem] = useState('') // added for problem description
  const [attachment, setAttachment] = useState(null) // added to add files


  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
  }

  const getAvilableSlots = async () => {
    setDocSlots([])

    let today = new Date()

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      let endTime = new Date()
      endTime.setDate(today.getDate() + i)
      endTime.setHours(21, 0, 0, 0)

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      let timeSlots = []

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: `2-digit`, minute: `2-digit`, hour12: `true` })

        let day = currentDate.getDate()
        let month = currentDate.getMonth() + 1
        let year = currentDate.getFullYear()

        const slotDate = day + '_' + month + '_' + year
        const slotTime = formattedTime

        const isSlotAvailable = !docInfo.slots_booked?.some(
          (slot) => slot.date === slotDate && slot.time === slotTime
        );

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          });
        }


        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }
      setDocSlots(prev => ([...prev, timeSlots]))
    }
  }


  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book Appointment')
      return navigate('/login')
    }

    try {
      const date = docSlots[slotIndex][0].datetime
      let day = date.getDate()
      let month = date.getMonth() + 1
      let year = date.getFullYear()

      const slotDate = day + '_' + month + '_' + year

      const formData = new FormData()
      formData.append('docId', docId)
      formData.append('slotDate', slotDate)
      formData.append('slotTime', slotTime)
      formData.append('description', problem)
      if (attachment) {
        formData.append('attachment', attachment)
      }

      const { data } = await axios.post(
        backendUrl + '/api/user/book-appointment',
        formData,
        {
          headers: {
            token,
            'Content-Type': 'multipart/form-data',
          }
        }
      )

      if (data.success) {
        toast.success(data.message)
        getDoctorsData()
        navigate('/myappointments')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }


  useEffect(() => {
    fetchDocInfo()
  }, [doctors, docId])

  useEffect(() => {
    getAvilableSlots()
  }, [docInfo])

  useEffect(() => {
    fetchDocInfo()
  }, [doctors, docId])

  useEffect(() => {
    getAvilableSlots()
  }, [docInfo])

  return docInfo && (
    <div>
      {/* Doctor details */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>

        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>{docInfo.name}
            <img className='w-4' src={assets1.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full '>{docInfo.experience}</button>
          </div>

          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-800 mt-3'>About <img src={assets1.info_icon} alt="" /></p>
            <p className='text-sm text-color gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>

          <p className='text-gray-600 font-medium mt-4'>Appointment fee : <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span></p>
        </div>
      </div>

      {/* Booking slots */}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking Slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {docSlots.length && docSlots.map((item, index) => (
            <div
              onClick={() => setSlotIndex(index)}
              className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'}`}
              key={index}>
              <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
              <p>{item[0] && item[0].datetime.getDate()}</p>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {docSlots.length && docSlots[slotIndex].map((item, index) => (
            <p
              onClick={() => setSlotTime(item.time)}
              className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`}
              key={index}>
              {item.time.toLowerCase()}
            </p>
          ))}
        </div>

        {/* Problem Description */}
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


        {/* File Attachment */}
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
          className='bg-primary text-white text-sm font-light px-10 py-3 rounded-full my-6'>
          Book Appointment
        </button>
      </div>

      {/* Related doctors */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  )
}

export default Appointments
