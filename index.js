const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const natural = require('natural');
const Title = require('./models/db');
const deniedDB = require('./models/denied');
const app = express();
const {verification} = require('./public/js/algo.js');
const ejsMate = require("ejs-mate");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local");
const user = require('./models/user');
const flash = require('connect-flash');

app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname ,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.engine("ejs", ejsMate);


const sessionOptions ={
    secret : "mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expire: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());
app.use((req,res,next)=>{
    res.locals.message = req.flash("message");
    res.locals.error = req.flash("error");
    next();
});

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

const MONGO_URL = 'mongodb://localhost:27017/SIH';

main().then(() => {
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// const disallowedWords = ['Police', 'Crime', 'Corruption', 'CBI', 'CID', 'Army'];
// const disallowedPrefixes = ['The', 'India', 'Samachar', 'News'];
// const disallowedSuffixes = ['Times', 'Post'];

// Middleware
let currTitle = "";
const middelware = async (req,res,next)=>{
    const newTitle = req.body.titleName;
    currTitle = newTitle;
    const response = await deniedDB.findOne({titleName:newTitle});
    console.log(response);
    if(!response){
        try {
            const allTitle = await Title.find({}, 'titleName'); // Fetch only titleName field
            const titleNames = allTitle.map(doc => doc.titleName); // Extract titleName into array
            const result = verification[0].verifyTitle(newTitle, titleNames);
            if(!result){
                const data = new deniedDB({
                    titleName: newTitle,
                });
                data.save();
            }
        } catch (error) {
            console.error('Error fetching title names:', error);
        }
    }
    next();
}



app.get("/", (req, res) => {
    res.send("I am Root");
});

app.get("/signup",(req,res)=>{
    res.render("user/signup.ejs");
});
app.post("/signup",async (req,res)=>{
    try{
    let {username , email , password} = req.body;
    const newUser = new user({email , username});
    const registeredUser = await user.register(newUser, password);
    console.log(registeredUser);
    req.flash("message","User Registered Succefully");
    res.redirect("/signup");
    }
    catch(error){
        req.flash("message",error.message);
        res.redirect("/signup");
    }
});
app.get("/signin",(req,res)=>{
    res.render("user/signin.ejs");
});
app.post("/signin",passport.authenticate("local",{failureRedirect:"/signin",failureFlash:true}),async(req,res)=>{
    req.flash("message","You are successfully logged in");
    res.redirect("/listing");
});
app.get("/listing/check", (req, res) => {
    const data = {
        titleName:"",
        probability: null
    }
    res.render("listing/check.ejs",{data});
});

app.post("/listing/check", middelware ,async (req, res) => {
    const data = {
        titleName : currTitle,
        probability: 5
    }
    console.log(currTitle);
    res.render("listing/check.ejs", {data});
});

app.get("/listing", async (req, res) => {
    const allDataSet = await Title.find({});
    res.render("listing/listing.ejs",{allDataSet});
});

app.get("/listing/show/:id",async(req,res)=>{
    let {id}=req.params;
    const title = await Title.findById(id);
    res.render("listing/show.ejs",{title});
})

const port = 3000;
app.listen(port, () => {
    console.log(`App is listening at Port ${port}`);
});
