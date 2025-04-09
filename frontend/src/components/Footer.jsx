import React from 'react'
import { assets1 } from '../assets/assets1'

const Footer = () => {
  return (
    <div className='md:mx-10'>
        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr]  gap-14 my-10 mt-40 text-sm'>
            {/* ----------- Left section ------------- */}
            <div>
                <img className='mb-5 w-40' src={assets1.logo} alt="" />
                <p className='w-full md:w-2/3 text-gray-600 leading-6'>Prescripto is dedicated to connecting patients with trusted healthcare professionals for convenient and reliable appointment booking. Our goal is to simplify healthcare by providing a seamless platform where you can browse verified doctors, choose based on your needs, and schedule appointments all in one place</p>
            </div>

            {/* ------------ Center section ------------- */}
            <div>
                <p className='text-xl font-medium mb-5'>Company</p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li>Home</li>
                    <li>About us</li>
                    <li>Contact us</li>
                    <li>Privacy policy</li>
                </ul>
            </div>

            {/* --------------- Right Section -------------- */}
            <div>
                <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li>+91 957430918</li>
                    <li>prescriptohelp@gmail.com</li>
                </ul>
            </div>
        </div>

        {/* ---------- Horizontal Line ----------- */}
        <div>
            <hr />
            <p className='py-5 text-sm text-center'>Copyright 2024@ Prescripto - All Right Reserved.</p>
        </div>
    </div>
  )
}

export default Footer