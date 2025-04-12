import express from 'express'
import { registerUser , loginUser, getProfile, updateProfile, bookAppointment, listAppointments, cancelAppointment,rescheduleAppointment,getAvailableSlots} from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'

const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)

userRouter.get('/get-profile',authUser,getProfile)
userRouter.post('/update-profile',upload.single('image'),authUser,updateProfile)
userRouter.post('/book-appointment', upload.single('attachment'), authUser, bookAppointment)
userRouter.get('/appointments',authUser,listAppointments)
userRouter.post('/cancel-appointment',authUser,cancelAppointment)
userRouter.post('/reschedule-appointment',authUser,rescheduleAppointment)
userRouter.post('/get-available-slots', authUser, getAvailableSlots)



export default userRouter