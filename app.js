//jshint esversion:6
import 'dotenv/config'
import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser"
import encrypt from "mongoose-encryption";
//Sezar şifreleme için gerekli istenilen sayıya göre alfabeyi kaydırır ve kelimeler şifreye göre tekrar şekillenir.
//Python da sezar şifreleme dosyası adınsa sezar şifreleme mevcut.
import ejs from "ejs";


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

// Şifre bir kademe daha güvenlidir aa yine de ulaşması kolaydır.
// .env dosyasında virgül noktalı virgül const gibi kodda kullandığımız öğeler kullanılmaz.
console.log(process.env.API_KEY);
UserSchema.plugin(encrypt, { secret: process.env.SECRET, excludeFromEncryption: ['password'] });
//UserSchema.plugin(encrypt, { secret: secret, excludeFromEncryption: ['password'] });
//Şifreleme paketini ekledik.
//şifrelenmesi gereken yeri en sonra köşeli parantez içine alırız.

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
    User.findOne({email: username}).then(function(faundUser){
        if(faundUser.password === password) {
            res.render("secrets")
        } else {
            res.render("register")
        }
    }) .catch (function(err){
        console.log(err)
    })
    
});

app.get("/register", (req,res)=> {
    res.render("register")
})

app.post("/register", (req,res)=> {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save().then(()=> {console.log("Kaydedildi."), res.render("secrets");}) .catch((err) => {console.log(err)});
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