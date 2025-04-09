import React from 'react'
import { assets1 } from '../assets/assets1'

const Contact = () => {
  return (
    <div>
      <div>
        <div class="text-center text-2xl pt-10 text-[#707070]">
          <p>CONTACT <span class="text-gray-700 font-semibold">US</span></p>
        </div>
        <div class="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm">
          <img class="w-full md:max-w-[360px]" src={assets1.contact_image} alt="" />
          <div class="flex flex-col justify-center items-start gap-6">
            <p class=" font-semibold text-lg text-gray-600">OUR OFFICE</p>
            <p class=" text-gray-500">201308, Greater Noida <br /> Suite 000, Uttar Pradesh, India</p>
            <p class=" text-gray-500">Tel: +91 9574309180 <br />Email: prescriptohelp@gmail.com</p>
            <p class=" font-semibold text-lg text-gray-600">CAREERS AT PRESCRIPTO</p>
            <p class=" text-gray-500">Learn more about our teams and job openings.</p>
            <button class="border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500">Explore Jobs</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact