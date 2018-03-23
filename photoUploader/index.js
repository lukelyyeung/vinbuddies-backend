const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const moment = require('moment');
const fileType = require('file-type');
const sha1 = require('sha1');

exports.handler = function(event, context) {
    let request = event.body;

    let base64String = request.base64String;

    let buffer = new Buffer(base64String, 'base64');
    let fileMime = fileType(buffer);

    if (fileMime === null) {
        return context.fail('The string supplied is not a file type.');
    };

    let file = getFile(fileMime, buffer);
    let params = file.params;

    s3.putObject(params, function(err, data) {
        if (err) {
            return console.log(err);
        }

        return file;
    });   
}

let getFile = function(fileMime, buffer) {
    let fileExt = fileMime.ext;
    let hash = sha1(new Buffer(new Date().toString()));
    let now = moment().valueOf();

    let filePath = hash + '/';
    let fileName = now + '.' + fileExt;
    console.log(fileName);
    let fileFullName = filePath + fileName;
    console.log(fileFullName);
    let filefullPath = 'https://s3.ap-northeast-2.amazonaws.com/vinbuddies/' + fileFullName;

    let params = {
        Bucket: 'vinbuddies',
        Key: fileFullName,
        Body: buffer
    };

    console.log(params.Key);

    let uploadFile = {
        size: buffer.toString('ascii').length,
        type: fileMime.mime,
        name: fileName,
        full_path: filefullPath,
    }

    return {
        'params': params,
        'uploadFile': uploadFile
    }
}




