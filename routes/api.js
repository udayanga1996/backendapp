const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Client = require('../models/client')
const Employee = require('../models/employee')
const Invoice = require('../models/invoice')
const Booking = require('../models/book')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const multer = require('multer');
// const email = require('./../thirdparty/sendgrid');
const db = "mongodb://Delta:123456a@ds163054.mlab.com:63054/work_and_hire"
const email = require('../email/email');
mongoose.connect(db, err => {
    if (err) {
        console.error('error ' + err)
    }
    else {
        console.log('Connected to DB')
    }
})

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads/');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);  //file.originalname
    }
});
const upload = multer({ storage: storage })

//API call
router.get('/', (req, res) => {
    res.send('From API route')
})
//-------------------------------------------------------------------------------------------------------------------------------------
//Register Employee
router.post('/employeeRegister', (req, res) => {
    let userData = req.body
    console.log(userData);
    let user = new Employee(userData)
    user.save((error, registeredEmployee) => {
        if (error) {
            console.log(error)
        }
        else {
            res.status(200).send(registeredEmployee)
        }
    })
})


//Register Client
router.post('/clientRegister', (req, res) => {
    let userData = req.body
    console.log(userData);
    let user = new Client(userData)
    user.save((error, registeredClient) => {
        if (error) {
            console.log(error)
        }
        else {
            res.status(200).send(registeredClient)
        }
    })
})


//client login mobile
router.get('/client/:email', function (req, res, next) {
    Client.findOne({ email: req.params.email }).then(function (client) {
        res.send(client);
    })
})


//Employee login mobile
router.get('/employees/:email', function (req, res, next) {
    Employee.findOne({ email: req.params.email }).then(function (employee) {
        res.send(employee);
    })
})

router.post('/login/employee', (req, res) => {
    let userData = req.body
    Employee.findOne({ email: userData.email }, (error, user) => {
        if (error) {
            console.log(error);
        }
        else {
            if (!user) {
                res.status(401).send('Email Invalid')
            }
            else {
                if (user.password !== userData.password) {
                    res.status(401).send('Not the Password')
                }
                else {
                    // res.status(200).send(user)
                    res.status(200).json({
                        "token": jwt.sign({ _id: user._id },
                            "SECRET#123",
                            {
                                expiresIn: "20m"
                            })
                    });
                }
            }

        }
    })
})

router.post('/login/client', (req, res) => {
    let userData = req.body
    Client.findOne({ email: userData.email }, (error, user) => {
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
                else {
                    // res.status(200).send(user)
                    res.status(200).json({
                        "token": jwt.sign({ _id: user._id },
                            "SECRET#123",
                            {
                                expiresIn: "20m"
                            })
                    });
                }
            }

        }
    })
})


//-------------------------------------------------------------------------------------------------------------------------------------

//search for employee list according to the worktype
router.get('/emp/:worktype', function (req, res, next) {
    Employee.find({ worktype: req.params.worktype }).then(function (employee) {
        res.send({ employee });
    })
})

//---------------------------------------Update employee's availability-----------------------------------------------------------
router.put('/empl/:id', function (req, res, next) {
    Employee.findByIdAndUpdate({ _id: req.params.id }, req.body).then(function (employee) {
        Employee.findOne({ _id: req.params.id }).then(function (employee) {
            res.send(employee);
        })
    })
})



//Access Employee Profile
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

//Rating of the employees
router.post('/addRating', (req, res) => {
    console.log(
        req.body.rating, req.body.userId
    );

    Employee.findOne({ "_id": req.body.userId }, function (err, data) {
        if (err) {
            console.log('error occured');
            console.log(err);
            res.status(400).send(err);
        } else {
            var ratingToSave = (req.body.rating + (data.ratingCount * data.rating)) / (data.ratingCount + 0)

            Employee.findByIdAndUpdate(
                { "_id": req.body.userId },
                { $set: { rating: ratingToSave, ratingCount: (data.ratingCount + 0) } }
                , function (err, data) {
                    if (err) {
                        console.log('error occured');
                        console.log(err);
                        res.status(400).send(err);
                    } else {
                        res.json({ message: 'success', details: "Add Rating Successfully" });
                    }
                });
        }
    });

});

//Save Employee Profile Picture
router.post('/employeeprofpicsave', upload.single('profpic'), (req, res) => {
    filepath = req.file.path;
    //console.log(bookingId)
    const query = { email: req.body.email };
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

//Save Client Profile Picture
router.post('/clientprofpicsave', upload.single('profpic'), (req, res) => {
    filepath = req.file.path;
    //console.log(bookingId)
    const query = { email: req.body.email };
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

//-------------------------------------------------------------------------------------------------------------------------------------

//Invoice to be created by Employee \ 30% of the Basic sal will be the service charge
router.post('/createInvoice', (req, res) => {
    console.log(req.body);
    const Basic_charge = parseInt(req.body.Basic_charge);
    const cost = parseInt((req.body.Basic_charge * 30) / 100);
    const total = Basic_charge + cost;
    // console.log(total);

    jwt.verify(req.body.token, "SECRET#123",
        (err, decoded) => {
            if (err) {
                console.log(err);
                return res.status(500).send({auth: false, message: 'Token authentication failed.' });
            }

            else {
                console.log(decoded._id);
                Employee.findOne({ _id: decoded._id }, (error, user) => {
                    if (error) {
                        console.log(error);
                        return res.status(500).send({ auth: false, message: 'Unauthorized atempt.' });
                    }
                    else {
                        // console.log(user);
                        let invoiceData = {
                            Employee_name: user.fname + " " +user.lname,
                            Basic_charge:  Basic_charge,
                            Cost: cost,
                            Total_Cost: total,
                            email : user.email,
                            mobile : user.mobileno
                        }
                        // console.log(invoiceData);
                        res.json({invoice:invoiceData});
                    }
                });
            }
        });
});

router.post('/saveInvoice', (req, res) => {
    let userData = req.body.Frontinvoice
    let invoice = new Invoice(userData)
    invoice.save((error, savedInvoice) => {
        if (error) {
            console.log(error)
            res.json({success:false, msg:"System error please Try later"});
        }
        else {
            email.newUserEmail(userData.email,userData);
            res.json({success:true,msg:" Invoce data saved and send to your email"});
        }
    });
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


//cancelling the job request
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

//sending invoice mail
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
//-------------------------------------------------------------------------------------------------------------------------------------
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
                    "token": jwt.sign({ _id: user._id, name: user.fname },
                        "SECRET#123",
                        {
                            expiresIn: "20m"
                        })
                });
            }

        }
    })
})


module.exports = router

//module.exports = router


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


