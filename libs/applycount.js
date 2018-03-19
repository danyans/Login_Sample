var moment = require('moment');
var schedule = require('node-schedule');

var libs = process.cwd() + '/libs/';

var log = require(libs + 'controllers/log')(module);
var db = require(libs + 'db/mongoose');
var WolfApply = require(libs + 'model/wolfApply');
var config = require(libs + 'controllers/config');
var nodemailer = require(libs + 'controllers/email');

// const number =2;
// const schuedule_time ='11 10 * * *';
var transport = config.get('transport');
var number = config.get('number');
var schuedule_time= config.get('schedule_time');

schedule.scheduleJob(schuedule_time,function(){
    console.log('send a email');
    var today = moment().startOf('day');  //local time date
    var tomorrow = moment(today).add(1, 'days');
    WolfApply.find({'created':{"$gte":today.toDate(),"$lt":tomorrow.toDate()}},function (err, wolfapplies) {
        if (!err) {
            console.log(wolfapplies);
            var String = JSON.stringify(wolfapplies);
            var obj = JSON.parse(String);
            console.log(obj.length);
            if(obj.length >= number){
                console.log('send a email');
                var emails='';
                for(var i = 0;i <obj.length ; i++){
                emails += obj[i].email + ', ';
             }
             emails = emails.substring(0,emails.length-2);
             console.log(emails);
             nodemailer.email(transport,mailDetail(emails));
            }      
        } else {
            console.log(500);
        }
    });  
});

// setup email data with unicode symbols
function mailDetail(toMail){

    var mailOptions = {
        from: '"nikis" <niki.sun@ehealth.com>', // sender address
        to: toMail, // list of receivers
        subject: 'Hello ✔', // Subject line
        text: 'Hello world?', // plain text body
        html: '<b>Hello world?</b>' // html body 
    };  

    return mailOptions;
}






