import multer from 'multer'
import path from 'path'
const storage = multer.diskStorage({
    filename: function(req,file,callback){
        callback(null,file.originalname)
    }
})
const upload = multer({storage})
export default upload