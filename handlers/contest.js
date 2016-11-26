//引入formidable，用于上传文件
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
// 确保存在目录data
//var dataDir = __dirname + '/data';
var dataDir = path.resolve(__dirname, '..') + '/data';
var vacationPhotoDir = dataDir + '/vacation-photo';
fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir);

exports.get_vacation_photo = function(req, res) {
    var now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(),
        month: now.getMonth()
    });
};

exports.post_vacation_photo = function(req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            if (err) return res.redirect(303, '/error');
            if (err) {
                res.session.flash = {
                    type: 'danger',
                    intro: 'Oops!',
                    message: 'There was an error processing your submission. ' +
                        'Pelase try again.',
                };
                return res.redirect(303, '/contest/vacation-photo');
            }
            var photo = files.photo;
            var dir = vacationPhotoDir + '/' + Date.now();
            var path = dir + '/' + photo.name;
            fs.mkdirSync(dir);
            fs.renameSync(photo.path, dir + '/' + photo.name);
            saveContestEntry('vacation-photo', fields.email,
                req.params.year, req.params.month, path);
            req.session.flash = {
                type: 'success',
                intro: 'Good luck!',
                message: 'You have been entered into the contest.',
            };
            return res.redirect(303, '/contest/vacation-photo/entries');
        });
};

function saveContestEntry(contestName, email, year, month, photoPath) {
    // TODO……这个稍后再做
}