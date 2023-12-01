import multer from 'multer';

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // Verificar se o tipo do arquivo é válido
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        // Rejeitar o arquivo
        cb(new Error('Unsupported File Format, only JPEG, PNG, JPG, and PDF can be supported.'), false);
    }
};

const uploadSingleInvoice = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limite de 5MB
    },
    
});

export default  uploadSingleInvoice;
