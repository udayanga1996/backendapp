const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('');

function newUserEmail(email, invoice) {
    // using SendGrid's v3 Node.js Library
    // https://github.com/sendgrid/sendgrid-nodejs
    const msg = {
        to: email,
        from: 'workAndHire@wrk.com',
        subject: 'Your Invoice',
        text: 'Invoice',
        html: '<p> Dear ' + invoice.Employee_name + ' this is your invoice from Work and hire </p>' +'<strong> Basic charge : '+invoice.Basic_charge+'</strong>  <br>  <strong> Service Charge : '+ invoice.Cost +'</strong> <br> <strong> Total Cost : ' + invoice.Total_Cost +'</strong>',
    };
    sgMail.send(msg).then(result =>{
        console.log(result);
        
    });
}
module.exports = {
    newUserEmail
}