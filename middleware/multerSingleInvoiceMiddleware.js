const multer = require('multer');

const storage = multer.memoryStorage(); // Salvar os arquivos na memória

const fileFilter = (req, file, cb) => {
    // Verificar se o tipo do arquivo é válido
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
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
    fileFilter: fileFilter // Adicione a função de filtro
});

module.exports = uploadSingleInvoice;
