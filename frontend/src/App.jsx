import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointments from './pages/Appointments'
import ArticlePage from './pages/ArticlePage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <div className='mx-4 sm:mx -[10%]'>
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/doctors' element={<Doctors />} />
        <Route path='/doctors/:speciality' element={<Doctors />} />
        <Route path='/login' element={<Login />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/myprofile' element={<MyProfile />} />
        <Route path='/myappointments' element={<MyAppointments />} />
        <Route path='/appointments/:docId' element={<Appointments />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/article" element={<ArticlePage />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
