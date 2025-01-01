import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/temp'); // Specifies where the uploaded files should be stored on the server.
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Sets the name of the uploaded file to its original name.
    },
});
  
  
export const upload = multer({ storage: storage })
