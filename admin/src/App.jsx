import React, { useContext } from 'react';
import Login from './pages/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/admin/Dashboard';
import AllAppointment from './pages/admin/AllAppointment';
import AddDoctor from './pages/admin/AddDoctor';
import DoctorList from './pages/admin/DoctorsList';
import AddArticle from './pages/admin/AddArticle'; // Import AddArticle
import { DoctorContext } from './context/DoctorContext';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointment from './pages/doctor/DoctorAppointment';
import DoctorProfile from './pages/doctor/DoctorProfile';
import AddPatient from './pages/admin/AddPatient';

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  return aToken || dToken ? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <Routes>
          {/* Admin routes */}
          <Route path='/' element={<></>} />
          <Route path='/admin-dashboard' element={<Dashboard />} />
          <Route path='/all-appointment' element={<AllAppointment />} />
          <Route path='/add-doctor' element={<AddDoctor />} />
          <Route path='/doctor-list' element={<DoctorList />} />
          <Route path='/add-article' element={<AddArticle />} /> {/* New route for AddArticle */}
          <Route path='/add-patient' element={<AddPatient />} />

          {/* Doctor routes */}
          <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
          <Route path='/doctor-appointments' element={<DoctorAppointment />} />
          <Route path='/doctor-profile' element={<DoctorProfile />} />
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  );
};

export default App;