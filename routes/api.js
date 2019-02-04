const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Client = require('../models/client')
const Employee = require('../models/employee')
const Invoice = require('../models/invoice')
const Booking = require('../models/book')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const multer  = require('multer');
const email = require('./../thirdparty/sendgrid');
//const db = "mongodb://localhost:27017/work_and_hire"
const db = "mongodb://Delta:123456a@ds163054.mlab.com:63054/work_and_hire"
mongoose.connect(db, err => {
    if (err) {
        console.error('error ' + err)
    }
    else {
        console.log('Connected to DB')
    }
})

const storage = multer.diskStorage({ 
    destination: function(req,file,callback){
      callback(null,'./uploads/');
    },
    filename: function(req,file,callback){
      callback(null,file.originalname);  //file.originalname
    }
  });
  const upload = multer({ storage: storage })

router.get('/', (req, res) => {
    res.send('From API route')
})


router.post('/employeeRegister', (req, res) => {
    let userData = req.body
    console.log(userData);
    let user = new Employee(userData)
    user.save((error, registeredUser) => {
        if (error) {
            console.log(error)
        }
        else {
            res.status(200).send(registeredUser)
        }
    })
})

router.post('/clientRegister', (req, res) => {
    let userData = req.body
    console.log(userData);
    let user = new Client(userData)
    user.save((error, registeredUser) => {
        if (error) {
            console.log(error)
        }
        else {
            res.status(200).send(registeredUser)
        }
    })
})

router.post('/login', (req, res) => {
    let userData = req.body
    User.findOne({ email: userData.email }, (error, user) => {
        if (error) {
            console.log(error)
        }
        else {
            if (!user) {
                res.status(401).send('Email Invalid')
            }
            else {
                if (user.password !== userData.password) {
                    res.status(401).send('Not the Password')
                }
                res.status(200).json({
                    "token": jwt.sign({ _id: user._id },
                        "SECRET#123",
                        {
                            expiresIn: "20m"
                        })
                });
            }

        }
    })
})



router.get('/client/:email', function (req, res, next) {
    Client.findOne({ email: req.params.email }).then(function (client) {
        res.send(client);
    })
})

router.get('/employees/:email', function (req, res, next) {
    Employee.findOne({ email: req.params.email }).then(function (employee) {
        res.send(employee);
    })
})

router.get('/emp/:worktype', function (req, res, next) {
    Employee.find({ worktype: req.params.worktype }).then(function (employee) {
        res.send({ employee });
    })
})




router.post('/profile', (req, res) => {
    // let userData=req.
    // console.log(req.body.token)
    let userId
    jwt.verify(req.body.token, "SECRET#123",
        (err, decoded) => {
            if (err)
                return res.status(500).send({ auth: false, message: 'Token authentication failed.' });
            else {
                userId = decoded._id;
                // next();
            }
        })


    User.findOne({ _id: userId }, (error, user) => {
        if (error) {
            console.log(error)
        }
        else {
            if (!user) {
                res.status(401).send('Email Invalid')
            }

            else {
                // res.status(200).send(user)
                // res.status(401).send('Email Invalid')
                res.status(200).json({ status: true, user })
            }

        }
    })


});

router.post('/getEmployeeByCategory', (req, res) => {
    var catogery = req.body.worktype;
    const query = { worktype: catogery };
    Employee.find(query, (err, emp) => {
        if (err) {
            res.json({ state: false });
        }
        else {
            res.json({ state: true, employees: emp });
        }
    })
});

router.post('/getEmployeeDetails', (req, res) => {
    var email = req.body;
    const query = { email: email };
    Employee.findOne(query, (err, emp) => {
        if (err) {
            res.json({ state: false });
        }
        else {
            res.json({ state: true, employee: emp });
        }
    })
});
router.post('/createInvoice', (req, res) => {
   // var cost=(parseInt(req.body.Basic_charge)*30)/100
    let invoiceData = {
        User_ID: req.body.User_ID,
        Employee_name: req.body.Employee_name,
        Basic_charge: req.body.Basic_charge,
        Cost: (parseInt(req.body.Basic_charge)*30)/100,
        Total_Cost: parseInt(req.body.Basic_charge)+(parseInt(req.body.Basic_charge)*30)/100,
    }
    console.log(invoiceData)
    console.log("In backend " + JSON.stringify(invoiceData));
    let invoice = new Invoice(invoiceData)
    invoice.save((error, registeredInvoice) => {
        if (error) {
            console.log(error)
        }
        else {
            res.status(200).send(registeredInvoice)
        }
    })
})


router.post('/bookemployee', (req, res) => {
    var bookingData = req.body;
    let booking = new Booking(bookingData)
    booking.save((err, booking) => {
        if (err) {
            //console.log(err)
            res.json({ state: false });
        }
        else {
            res.json({ state: true, Booking: booking });
        }
    })
});

router.post('/cancelbooking', (req, res) => {
    var bookingId = req.body.id;
    //console.log(bookingId)
    const query = { Bookingid: bookingId };
    Booking.update(query, { $set: { Booking_status: "canceled" } }, (err, booking) => {
        if (err) {
            // console.log(err)
            res.json({ state: false });
        }
        else {
            res.json({ state: true, Booking: booking });
        }
    })
});

router.post('/clientBooking', (req, res) => {
    var clientname = req.body.clientname;
    //console.log(bookingId)
    const query = { Client_name: clientname };
    Booking.find(query, (err, bookings) => {
        if (err) {
            // console.log(err)
            res.json({ state: false });
        }
        else {
            res.json({ state: true, Bookings: bookings });
        }
    })
});


router.post('/sendemail', (req, res) => {
    var myemail = req.body.email
    const query = { _id: req.body.id };
    Invoice.findOne(query, (err, myinvoice) => {
        if (err) {
            //console.log(err)
            res.json({ state: false });
        } else {
            console.log(myinvoice)
            email.sendinvoice(myemail, myinvoice, (err, callb) => {
                if (err) {
                    //console.log(err)
                    res.json({ state: false });
                } else {
                    res.json({ state: true, mag: "email sent" });
                }
            })
        }
    })

})



router.post('/employeeprofpicsave',upload.single('profpic'), (req, res) => {
    filepath = req.file.path;
    //console.log(bookingId)
    const query = { email: req.body.email};
    Employee.update(query, { $set: { image: filepath } }, (err, user) => {
        if (err) {
            // console.log(err)
            res.json({ state: false });
        }
        else {
            res.json({ state: true, user: user });
        }
    })
});

router.post('/clientprofpicsave',upload.single('profpic'), (req, res) => {
    filepath = req.file.path;
    //console.log(bookingId)
    const query = { email: req.body.email};
    Client.update(query, { $set: { image: filepath } }, (err, user) => {
        if (err) {
            // console.log(err)
            res.json({ state: false });
        }
        else {
            res.json({ state: true, user: user });
        }
    })
});

module.exports = router


/*router.post('/register', (req, res) => {
    let userData = req.body
    let user = new User(userData)
    user.save((error, registeredUser) => {
        if (error) {
            console.log(error)
        }
        else {
            res.status(200).send(registeredUser)
        }
    })
})*/

/*router.post('/Employeelogin', (req, res) => {
    let userData = req.body
    User.findOne({email:userData.email }, (error, Employee) => {
        if (error) {
            console.log(error)
        }
        else {
            if (!Employee) {
                res.status(401).send('Email Invalid')
            }
            else {
                if (Employee.password !== userData.password) {
                    res.status(401).send('Not the Password')
                }
            }

        }
    })
})*/


/*router.post('/createinvoice', (req, res) => {
    var invoiceData = req.body;
    let invoice = new Invoice(invoiceData)
    invoice.save((err, invoice) => {
        if (err) {
            // console.log(err)
            res.json({ state: false });
        }
        else {
            res.json({ state: true, Booking: invoice });
        }
    })
});*/
