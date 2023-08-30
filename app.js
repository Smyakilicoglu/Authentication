//jshint esversion:6
import ejs from "ejs";
import 'dotenv/config'
import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser"
import bcrypt from "bcrypt";
const saltRounds = 10;
//buradaki sayı ne kadar artarsa bilgisayar o kadar karmaşık sayı üretmek için çalışır.
//Sayı ne kadar artarsa oluyşturulmak için verilen sürenin artması gerekir.


mongoose.connect("mongodb://127.0.0.1:27017/SecretsDB");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true, 
        lowercase: true,
        required: 'Email address is required',
    }
    ,
    password: {
        required: true,
        type: String,
    },
})



const SecretShema = new mongoose.Schema({
    secret: String,
})

const Secret = mongoose.model("Secret", SecretShema);
const User = mongoose.model("User", UserSchema);


const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req,res) => {
    res.render("home");
})

app.get("/login", (req,res)=> {
    res.render("login");
})

app.post("/login", (req,res)=> {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({email: username}).then(function(foundUser){
        bcrypt.compare(password, foundUser.password , function(err, result) {
            // result == true hash = faundUser.password 
            if (result === true) {
                res.render("secrets")
            }
        })
    }) .catch (function(err){
        console.log(err)
    })
    
});

app.get("/register", (req,res)=> {
    res.render("register")
})

app.post("/register", (req,res)=> {

    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
            // Store hash in your password DB.
            const newUser = new User({
                email: req.body.username,
                password: hash
            });
            newUser.save().then(()=> {console.log("Kaydedildi."), res.render("secrets");}) .catch((err) => {console.log(err)});
        });
    });

    
    /*
    User.insertMany(emailarray).then(function(){
        emailarray.push(mail);  
    }) .catch(function(err){
        console.log(err);
    }) */
    
})

app.get("/submit", (req,res)=> {
    res.render("submit");
})

app.post("/submit",(req,res)=> {
    const newSecret = new Secret({
        secret: req.body.secret,
    });
    newSecret.save().then(()=> {console.log("gizli bilgi")});
    res.render("secrets")
})

app.listen(port, function(){
    console.log(`Server running on port ${port}`);
})


const findDocuments = function(db, callback) {
    const collection = db.collection('items'); 
    collection.find({}).toArray(function(err, secrets) {
        assert.equal(err, null); 
        console.log("Found the following records"); 
        console.log(secrets); 
        callback(secrets);
    });
};