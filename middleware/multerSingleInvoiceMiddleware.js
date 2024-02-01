import multer from 'multer';

// Define the storage settings for multer
const storage = multer.diskStorage({
    // Define how the filename should be stored
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Define a function to filter the types of files allowed for upload
const fileFilter = (req, file, cb) => {
    // Define the allowed MIME types
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/pdf'];
    // Check if the MIME type of the file is in the allowed types
    if (allowedMimeTypes.includes(file.mimetype)) {
        // If the MIME type is allowed, accept the file
        cb(null, true);
    } else {
        // If the MIME type is not allowed, reject the file
        cb(new Error('Unsupported File Format, only JPEG, PNG, JPG, and PDF can be supported.'), false);
    }
};

// Configure multer with the storage settings and file filter
const uploadSingleInvoice = multer({
    storage: storage,
    limits: {
        // Limit the file size to 5MB
        fileSize: 1024 * 1024 * 5 // 5 Megabytes
    },
    fileFilter: fileFilter // Apply the file filter function
});

export default uploadSingleInvoice; // Export the configured multer middleware
