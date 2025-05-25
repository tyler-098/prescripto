import React, { useContext, useState, useEffect, useRef } from 'react';
import { assets1 } from '../assets/assets1';
import { AdminContext } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { DoctorContext } from '../context/DoctorContext';
import { toast } from 'react-toastify';

const Navbar = () => {
    const { aToken, setAToken } = useContext(AdminContext);
    const { dToken, setDToken, profileData, getProfileData } = useContext(DoctorContext);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Fetch doctor profile data if not already available
    useEffect(() => {
        if (dToken && !profileData) {
            console.log('Calling getProfileData to fetch doctor data');
            getProfileData();
        }
    }, [dToken, profileData, getProfileData]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const logout = () => {
        navigate('/');
        if (aToken) {
            setAToken('');
            localStorage.removeItem('aToken');
        }
        if (dToken) {
            setDToken('');
            localStorage.removeItem('dToken');
        }
        setShowLogoutPopup(false);
        setShowDropdown(false);
    };

    const handleDropdownOption = (action) => {
        setShowDropdown(false);
        if (action === 'profile') {
            navigate('/doctor-profile');
        } else if (action === 'appointments') {
            navigate('/doctor-appointments');
        } else if (action === 'logout') {
            setShowLogoutPopup(true);
        }
    };

    return (
        <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
            <div className="flex items-center gap-2 text-xs">
                <img className="w-32 sm:w-40 cursor-pointer" src={assets1.admin_logo} alt="Logo" />
                <p className="border px-2.5 py-0.5 rounded-full border-gray-600 text-gray-600">
                    {aToken ? 'Admin' : 'Doctor'}
                </p>
            </div>
            {dToken ? (
                <div className="relative" ref={dropdownRef}>
                    <div className="p-1 bg-blue-200 rounded-full">
                        <img
                            src={profileData?.image || assets1.default_doctor_image}
                            alt="Doctor"
                            onError={(e) => {
                                console.log('Image load error, using fallback');
                                e.target.src = assets1.default_doctor_image;
                            }}
                            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setShowDropdown(!showDropdown)}
                            title="Profile Options"
                        />
                    </div>
                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                            <button
                                onClick={() => handleDropdownOption('profile')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Profile
                            </button>
                            <button
                                onClick={() => handleDropdownOption('appointments')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                My Appointments
                            </button>
                            <button
                                onClick={() => handleDropdownOption('logout')}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    onClick={() => setShowLogoutPopup(true)}
                    className="bg-primary text-white text-sm px-8 py-2 rounded-full"
                >
                    Logout
                </button>
            )}

            {/* Logout Confirmation Popup */}
            {showLogoutPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Logout</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to logout?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutPopup(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;