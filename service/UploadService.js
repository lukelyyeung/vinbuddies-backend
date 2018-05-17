const fs = require('fs-extra');
const path = require('path');
const sha1 = require('sha1');
const fileType = require('file-type');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.outputFile);
const deleteFileAsync = fs.remove;
const { EVENT_STATUS } = require('../constant/eventConstant')
const acceptedFileType = ['jpg', 'png', 'jpeg'];
const store = {
    event: 'event',
    profile: 'profile'
}

class UploadService {
    constructor() { }

    async photoUpload(req, location) {
        let photoPaths = {};
        let { body } = req;
        let keys = Object.keys(body);
        try {
            for (const key of keys) {
                if (Array.isArray(body[key])) {

                    for (const photoString of body[key]) {
                        const buffer = new Buffer(photoString, 'base64');
                        const hash = sha1(new Date().toString());
                        const firstFolder = hash.substr(0, 3) + '/';
                        const secondFolder = hash.substr(hash.length - 3) + '/';
                        const fileName = Date.now();
                        const fileMime = fileType(buffer);
                        if (fileMime === null) {
                            throw new Error(UPLOAD_STATUS.NO_FILE_TYPE);
                        }
                        const extension = fileMime.ext;
                        if (!acceptedFileType.some(e => e === extension)) {
                            throw new Error(UPLOAD_STATUS.INAPPROPRIATE_TYPE);
                        }

                        let fullFileName = path.join(__dirname, '../store', location, firstFolder, secondFolder, `${fileName}.${extension}`);
                        await writeFileAsync(fullFileName, buffer, 'binary');
                        photoPaths[key] = photoPaths[key] || [];
                        photoPaths[key].push(`${location}/${firstFolder}${secondFolder}${fileName}.${extension}`);
                    }
                }
            }
            return photoPaths;
            
        } catch (err) {
            console.log(err);
            throw new Error(EVENT_STATUS.UPLOAD_FAIL);
        }
    }

    async deletePhotos(req) {
        const { body: { photoPath } } = req;
        for (const path of paths) {
            await deleteFileAsync(path);
        }
    }
}

module.exports = UploadService