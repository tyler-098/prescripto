import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import razorpay from 'razorpay'




// api to register user
const registerUser = async (req,res) =>{
    try{
        const {name,email,password} = req.body

        if(!name || !email || !password){
            return res.json({success:false,message:"Missing details"})
        }

        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Enter a valid email address"})
        }
        //validating strong password
        if(password.length < 8){
            return res.json({success:false,message:"Enter a strong password"})
        }

        // hashing user password 
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const userData = {
            name,
            email,
            password:hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

        res.json({success:true,token})
    }
    catch{
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// api for user login
const loginUser = async (req,res) =>{
    try{


        const {email,password} = req.body
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false,message:"user does not exist"})
        }
        const isMatch = await bcrypt.compare(password,user.password)

        if(isMatch){
            const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
            res.json({success:true,token})
        }
        else{
            res.json({success:false,message:"Invalid password"})
        }
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})

    }
}

// API to get user profile data 

const getProfile = async(req,res) => {
    try{
        const {userId} = req.body
        const userData = await userModel.findById(userId).select('-password')
        res.json({success:true,userData})
    }
    catch(error){
         console.log(error)
        res.json({success:false,message:error.message})
    }
}

// API to update user profile 

const updateProfile = async (req,res) =>{
    try{

        const{userId,name,phone,address,dob,gender} = req.body
        const imageFile = req.file

        if(!name || !phone || !gender|| !dob){
            return res.jsonn({success:false,message:"Data Missing"})

        }

        await userModel.findByIdAndUpdate(userId,{name,phone,address,dob,gender})

        if(imageFile){
            // Upload image to cloduinary 
            const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"})
            const imageUrl = imageUpload.secure_url
            
            await userModel.findByIdAndUpdate(userId,{image:imageUrl})
        }


        res.json({success:true,message:"Profile Updated"})

    }
    catch(error){

    }
}

                                                 //*  API to book appointment 

const bookAppointment = async (req, res) => {
  try {
    // const userId = req.userId; // ✅ Use from token
    const { userId,docId, slotDate, slotTime, description } = req.body;

    const docData = await doctorModel.findById(docId).select('-password');
    if (!docData.available) {
      return res.json({ success: false, message: "Doctor not Available" });
    }

let slots_booked = docData.slots_booked

// Check if slot already booked
const isSlotTaken = slots_booked.find(
  (slot) => slot.date === slotDate && slot.time === slotTime
);

if (isSlotTaken) {
  return res.json({ success: false, message: "Doctor not Available" });
}

// Book the new slot
slots_booked.push({ date: slotDate, time: slotTime });


    const userData = await userModel.findById(userId).select('-password');
    delete docData.slots_booked;

    // ✅ Upload attachment if it exists
    let attachmentUrl = '';
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'auto',
        folder: 'attachments',
      });
      attachmentUrl = uploadResult.secure_url;
    }

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      description,
      attachmentUrl,
      date: Date.now()
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // ✅ Save updated slots
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    return res.json({ success: true, message: 'Appointment Booked' });

  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
}





                            //* API to get user appointment for frontend my-appointment page

const listAppointments = async (req,res) =>{
    try{

        const{userId} = req.body
        const appointments = await appointmentModel.find({userId})

        res.json({success:true,appointments})

    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})

    }
}


                                                    //* API to cancel appointment

const cancelAppointment = async (req,res) =>{
    try{
        const {userId,appointmentId} = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        /// Verify appointment user
        if(appointmentData.userId !== userId)
        {
            return res.json({success:false,message:"Unauthorized action"})
        }

        await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})
        // releasing doctor time slot in the case of cancellation

        const {docId,slotDate,slotTime} = appointmentData
        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e=>e!== slotTime)

        await doctorModel.findByIdAndUpdate(docId,{slots_booked})

        res.json({success:true,message:"Appointment cancelled"})
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

                        //* Api to reschedule appointment

const rescheduleAppointment = async (req, res) => {
  try {
     const { appointmentId, newSlotDate, newSlotTime } = req.body;
const existingAppointment = await appointmentModel.findById(appointmentId)
if (!existingAppointment) {
  return res.status(404).json({ success: false, message: 'Appointment not found' });
}

if (existingAppointment.rescheduled) {
  return res.status(400).json({ success: false, message: 'Appointment already rescheduled once' });
}

const doctor = await Doctor.findById(existingAppointment.docId);
if (!doctor) {
  return res.status(404).json({ success: false, message: 'Doctor not found' });
}

// Free old slot
doctor.slots_booked = doctor.slots_booked.filter(
  slot => !(slot.date === existingAppointment.slotDate && slot.time === existingAppointment.slotTime)
);

// Check if new slot is taken
const isNewSlotTaken = doctor.slots_booked.find(
  slot => slot.date === newSlotDate && slot.time === newSlotTime
);
if (isNewSlotTaken) {
  return res.status(400).json({ success: false, message: 'New slot already booked' });
}

// Book new slot
doctor.slots_booked.push({ date: newSlotDate, time: newSlotTime });

// Update appointment
existingAppointment.slotDate = newSlotDate;
existingAppointment.slotTime = newSlotTime;
existingAppointment.rescheduled = true;

await doctor.save();
await existingAppointment.save();

res.status(200).json({
  success: true,
  message: 'Appointment rescheduled successfully',
    appointment: {
    ...existingAppointment.toObject(),
    rescheduled: true, // Make sure it's explicitly included
  }
});


  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};




//* api to generate slot for next 7 days

// Function to generate next 7 days' slots excluding already booked ones
export const generateNext7DaysSlots = (slots_booked = []) => {
  // Transform booked array to object format: { "13_4_2025": ["10:00 AM", ...] }
  const bookedMap = {};
  slots_booked.forEach(({ date, time }) => {
  const upperTime = time ? time.toUpperCase() : null;
    if (!bookedMap[date]) bookedMap[date] = [];
    bookedMap[date].push(upperTime);
  });

  const slots = [];
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const daySlots = [];
    const current = new Date(now);
    current.setDate(current.getDate() + i);

    const day = current.getDate();
    const month = current.getMonth() + 1;
    const year = current.getFullYear();
    const dateKey = `${day}_${month}_${year}`;

    let slotStart = new Date(current);
    let endTime = new Date(current);
    endTime.setHours(21, 0, 0, 0); // Clinic closes at 9 PM

    if (i === 0) {
      const nowHour = now.getHours();
      const nowMin = now.getMinutes();

      slotStart.setHours(Math.max(10, nowHour));
      slotStart.setMinutes(nowMin >= 30 ? 0 : 30);
      if (nowMin >= 30) slotStart.setHours(slotStart.getHours() + 1);
    } else {
      slotStart.setHours(10, 0, 0, 0); // Start at 10 AM for other days
    }

    while (slotStart < endTime) {
      const formatted = slotStart.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const isBooked = bookedMap[dateKey]?.includes(formatted);

      if (!isBooked) {
        daySlots.push({
          datetime: new Date(slotStart),
          time: formatted,
        });
      }

      slotStart.setMinutes(slotStart.getMinutes() + 30);
    }

    slots.push({ date: dateKey, slots: daySlots });
  }

  return slots;
};


//* ============================= API to get Available slots ===============================

import Doctor from '../models/doctorModel.js';

const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.body;
    console.log("Doctor ID received:", req.body.doctorId);

    const doctor = await Doctor.findById(doctorId);
    console.log(doctor)
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
      
    }

    const slots_booked = doctor.slots_booked || {};
    const availableSlots = generateNext7DaysSlots(slots_booked);

    res.status(200).json({
        success: true,
    availableSlots: availableSlots,
        });

  } catch (error) {
    console.error('Error in getAvailableSlots:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export {registerUser,loginUser,getProfile,updateProfile,bookAppointment,listAppointments,cancelAppointment,rescheduleAppointment,getAvailableSlots}