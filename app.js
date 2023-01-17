// We can use express as shown as below
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const request = require('request');
const ejs = require("ejs");
const session = require('express-session');
const flash = require("connect-flash");
const mongoose=require('mongoose');
const app = express();
const port = 3000


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({ cookie: { maxAge: 60000 }, 
    secret: 'woot',
    resave: false, 
    saveUninitialized: false}));
mongoose.set('strictQuery', true)
app.use(flash());

// mongoose connect to the Database
mongoose.connect('mongodb://0.0.0.0:27017/EmployeesDB')
// create a schemma

const employeschema = new mongoose.Schema({
    first_name:String,
    last_name:String,
    email_id:String
})

// create a model of the database
const Employe = mongoose.model('Employee',employeschema); 


app.get('/', (req, res) => {
    const message = req.flash("error");
    res.render('home',{message})
})

app.get('/user_data',(req,res)=>{
    let page = req.query.page || 1;
    let limit = 10;
    let skip = (page - 1) * limit;
    Employe.find({}).skip(skip).limit(limit).exec(function(err, items) {
        if(!err){
            if(items.length===0){
                console.log("no data");
                req.flash("error", "No Date on the DataBase");
                res.redirect('/')
            }else{
                // console.log(people);
                Employe.count().exec(function(err, count) {
                    res.render('data', {
                    data: items,
                    current: page,
                    pages: Math.ceil(count / limit)
                })
            })
        }
    }
    });
    
    
    
})

app.post('/fetch_data',(req,res)=>{
        const url = 'https://randomuser.me/api/?results=50';
        request(url, { json: true }, (err, response, body) => {
        if (err) {
            return console.log(err); 
        }else{
            body.results.forEach(element => {
                console.log(element.name);
                console.log(element.email);
                const new_data = new Employe({
                    first_name:element.name.first,
                    last_name:element.name.last,
                    email_id:element.email
                })
                new_data.save()
            });
           req.flash("error", "Succefully Update Date to the DataBase");
           res.redirect('/') 
        }
        
    });
    
})
app.post('/',(req,res)=>{
    Employe.deleteMany(err =>{
        if(err){
            console.log(err);
        }else{
            console.log("Delete All")
            req.flash("error", "Delete all Date to the DateBase");
            res.redirect('/')
        }
    })
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
