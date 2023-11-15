const multer = require('multer');
const storage = multer.diskStorage({

    filename:function(req, file, cb){
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    // Verificar se o tipo do arquivo é válido
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        // Rejeitar o arquivo
        cb(new Error('Unsupported Image Format, only JPEG and PNG can be supported.'), false);
    }
}

const uploadSingleLogo = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5  // Limite de 5MB
    },
    fileFilter: fileFilter
});

module.exports = uploadSingleLogo;
