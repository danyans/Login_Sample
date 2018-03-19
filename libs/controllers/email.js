var nodemailer = require('nodemailer');

module.exports ={

    email:function(transport,mailOptions){

        nodemailer.createTransport(transport).sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return done(error,'done');
            }
            console.log('Message sent: ' + info.response);   
        });   
    } 
}




