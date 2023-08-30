//jshint esversion:6
import ejs from "ejs";
import 'dotenv/config'
import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
//Daha az kod satırıyla daha çok iş yapmak için kullanılır passport-local-mongoose

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

//Uygulamada gerekli oturum paketi için bu kodlar gerekli
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
}));

//Oturumun başlaması için passport kullanılmasını ve passport paketinin başlatılması için gerekli olan kod.
app.use(passport.initialize());
app.use(passport.session());
// Oturumu başlatmamız için yapmamız gerekenler.

mongoose.connect("mongodb://127.0.0.1:27017/SecretsDB");

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
})

UserSchema.plugin(passportLocalMongoose);


const SecretShema = new mongoose.Schema({
    secret: String,
})

const Secret = mongoose.model("Secret", SecretShema);
const User = mongoose.model("User", UserSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req,res) => {
    res.render("home");
})

app.get("/logout", (req, res) => {
    req.logout(req.user, err => {
      if(err) return next(err);
      res.redirect("/");
    });
});

app.get("/login", (req,res)=> {
    res.render("login");
})

app.post("/login", (req,res)=> {
    const user = new User({
        username: req.body.username,
        password: req.body.password
      });
    //Eğer burada oluşan bir hata varsa consola hatayı kaydeder yoksa şifreyi doğrulayıp sırrın bulunduğu sayfaya geçer.
    //register bölüminde kaydeilen çerezin burada kullanılma vakti.
      req.login(user, function(err){
        if (err) {
          console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
              });
            }
    });
        
});


app.get("/register", (req,res)=> {
    res.render("register")
})

app.get("/secrets", (req,res) => {
    //Tekrar giriş yapılmak istenildiğinde eğer oturum açıldıysa gizli sayfaya eğer oturum açılmadıysa register'a yönlendirir.
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        // eğer arma çubuğun https://localhost:3000/secrets yazarak sırların bulunduğu sayfaya gitmek istenilirse 
        //login sayfasına yönlendirilecek.
        res.redirect("/login");
    }
})

app.post("/register", (req,res)=> {

    User.register({username: req.body.username}, req.body.password , function(err, user) {
        if (err) { 
            console.log(err);
            res.redirect("/register")
         } 
        /* 
        const authenticate = User.authenticate();
         authenticate(req.body.username, req.body.password, function(err, result) {
            if (result === true) {
                res.redirect("/secrets")
            } else {
                console.log(err)
            }
        });
    });*/
        
        else {
            //mail ve şifre oluşturulduktan sonra kaydedilmesi ve gizli sayfaya gidilmesi gerekir.
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets")
            })
         }
        }); 
});

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