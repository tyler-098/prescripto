import jwt from 'jsonwebtoken'

// admin authentication middleware 
const authUser = async(req,res,next)=>{
    try{

        const {token} = req.headers
        console.log("received token "+token)
        if(!token){
            return res.json({success:false,message:"not authorized Login again user"})

        }
        const token_decode = jwt.verify(token,process.env.JWT_SECRET)

        req.body.userId = token_decode.id

        next()

    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }

}
export default authUser