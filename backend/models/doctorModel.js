import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
    name : {type:String,required:true},
    email : {type:String,required:true,unique:true},
    password : {type:String,required:true},
    image : {type:String,required:true},
    speciality : {type:String,required:true},
    experience : {type:String,required:true},
    degree : {type:String,required:true},
    about : {type:String,required:true},
    description: { type: String, required: false },
    available : {type:Boolean,default:true},
    fees : {type:Number,required:true},
    address : {type:String,required:true},
    date : {type:Number,required:true},
    attachmentUrl : { type: String, required: false },
    slots_booked: {
  type: [ { date: String, time: String } ],
  default: []
},
    
},{minimize:false})

const doctorModel = mongoose.models.doctor || mongoose.model('doctor',doctorSchema)
export default doctorModel