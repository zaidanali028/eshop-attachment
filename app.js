require('dotenv').config()
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const port = process.env.PORT ||5050;
const flash = require("connect-flash");
const session = require("express-session");
const ejs = require("ejs");
const mongoose = require("mongoose");
const uploader = require("express-fileupload");
const favicon = require("serve-favicon");
const cookieParser = require("cookie-parser");
const async = require("async");
const morgan = require("morgan");
var MongoStore = require("connect-mongo");



const dbUrI=process.env.DB_URL

const passport=require('passport')
require("./config/passport")(passport);


//db connection
mongoose
  .connect(dbUrI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((connected) => {
    console.log("db connected");
  })
  .catch((err) => {
    console.log(err);
  });

// express-fileupload middleware
app.use(
  uploader({
    useTempFiles: true,
  })
);

//body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




// flash message
app.use(flash());

//static files
app.use(express.static(path.join(__dirname, "public")));
// favicon

app.use(favicon(__dirname +'/public/images/favicon.png'));


//method override to be used for sending put requests
app.use(methodOverride("_method"));


app.use(cookieParser())




//view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set(express.static(path.join(__dirname, "public")));




app.use(session({
  secret:  process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  
  //session expires after 3 hours
  cookie: { maxAge: 60 * 1000 * 60 * 3 },
  store: MongoStore.create({
    mongoUrl: dbUrI
})


})
);


// This should alwayse between session and flash
app.use(passport.initialize());
app.use(passport.session());


// declaring local variables for displaying FLASH messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  res.locals.errors = req.flash("errors");
  res.locals.stockErr = req.flash("stockErr");

  next();
});


//routes
const homeRoutes = require("./routes/home/index");
const adminRoutes = require("./routes/admin/index");
const userRoutes = require("./routes/home/user");
const googleFbAuthRoute = require("./routes/auth");


//route usages
app.use("/auth", googleFbAuthRoute);

app.use("/admin", adminRoutes);
app.use("/users", userRoutes);
app.use("/", homeRoutes);

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
/*End of app.js*/ 