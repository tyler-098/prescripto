import React from 'react'
import { assets1 } from '../assets/assets1'
import { useNavigate } from 'react-router-dom'

const Banner = () => {

    const navigate = useNavigate()
  return (
    <div className='flex bg-primary rounded-lg px-6 sm:px-10 lg:px-12 my-20 md:mx-10 '>
        {/* -------- Left side ---------- */}
        <div className='flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5'>
            <p className='text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-white'>
                Book Appointment
            </p>
            <p className='text-lg sm:text-xl md:text-2xl lg:text-4xl font-semibold text-white'>
                With 100+ Trusted Doctors
            </p>
            <button onClick={()=>{navigate('/login');scrollTo(0.0)}} className='bg-white text-sm sm:text-base text-gray-600 px-8 py-3 rounded-full mt-6 hover:scale-105 transition-all '>Create account</button>
        </div>
        {/* -------- Right side ---------- */}
        <div className='hidden md:block md:w-1/2 lg:w-[370px] relative'>
            <img className='w-full absolute bottom-0 right-0 max-w-md' src={assets1.appointment_img} alt="" />
        </div>
    </div>
  )
}

export default Banner