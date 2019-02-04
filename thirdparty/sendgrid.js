const apikey="//key";
var helper = require('sendgrid').mail;
var fromEmail = new helper.Email('Work_H_Hire@gmail.com');

module.exports.sendinvoice=function(email,invoice,callback){
    console.log(email)
        var toEmail = new helper.Email(email);
        var subject = 'TIDYMASTER';
        var content = new helper.Content('text/plain', 'Invoice details:'+invoice);
        var mail = new helper.Mail(fromEmail, subject, toEmail, content);
        var sg = require('sendgrid')(apikey);
        var request = sg.emptyRequest({
            method: 'POST',
            path: '/v3/mail/send',
            body: mail.toJSON()
        });
        sg.API(request, function (error, response) {
        if (error) {
            callback(error);
        }else{
            //console.log(response)
            callback(null,response);
        }
            
        });
}
