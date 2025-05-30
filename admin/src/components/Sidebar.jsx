import React, { useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import { NavLink } from 'react-router-dom';
import { assets1 } from '../assets/assets1';
import { DoctorContext } from '../context/DoctorContext';

const Sidebar = () => {
    const { aToken } = useContext(AdminContext);
    const { dToken } = useContext(DoctorContext);

    return (
        <div className='min-h-screen bg-white border-r'>
            {aToken && (
                <ul className='text-[#515151] mt-5'>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''
                            }`
                        }
                        to={'/admin-dashboard'}
                    >
                        <img src={assets1.home_icon} alt='' />
                        <p>Dashboard</p>
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''
                            }`
                        }
                        to={'/all-appointment'}
                    >
                        <img src={assets1.appointment_icon} alt='' />
                        <p>Appointments</p>
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''
                            }`
                        }
                        to={'/add-doctor'}
                    >
                        <img src={assets1.add_icon} alt='' />
                        <p>Add Doctor</p>
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''
                            }`
                        }
                        to={'/doctor-list'}
                    >
                        <img src={assets1.people_icon} alt='' />
                        <p>Doctors List</p>
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''
                            }`
                        }
                        to={'/add-patient'}
                    >
                        <img src={assets1.add_icon} alt='' />
                        <p>Add Patient</p>
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''
                            }`
                        }
                        to={'/add-article'}
                    >
                        <img src={assets1.add_icon} alt='' />
                        <p>Add Article</p>
                    </NavLink>
                </ul>
            )}
            {dToken && (
                <ul className='text-[#515151] mt-5'>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''
                            }`
                        }
                        to={'/doctor-dashboard'}
                    >
                        <img src={assets1.home_icon} alt='' />
                        <p>Dashboard</p>
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''
                            }`
                        }
                        to={'/doctor-appointments'}
                    >
                        <img src={assets1.appointment_icon} alt='' />
                        <p>Appointments</p>
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''
                            }`
                        }
                        to={'/doctor-profile'}
                    >
                        <img src={assets1.people_icon} alt='' />
                        <p>Profile</p>
                    </NavLink>
                </ul>
            )}
        </div>
    );
};

export default Sidebar;