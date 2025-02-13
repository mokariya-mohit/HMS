const fileUpload = require('express-fileupload');

const uploadMiddleware = () => {
    return fileUpload({
        createParentPath: true,
        limits: { fileSize: 5 * 1024 * 1024 },
        abortOnLimit: true,
        useTempFiles: true,
        tempFileDir: '/tmp/',
        preserveExtension: true,
    });
};

module.exports = uploadMiddleware;
