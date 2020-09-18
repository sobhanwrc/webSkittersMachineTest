import express from "express"
import session from "express-session"
import http from "http"
import mongoose from "mongoose"
import path from "path"
import bodyParser from "body-parser"
import flash from "connect-flash"
import cookieParser from "cookie-parser"
import userRoute from "./routes/userRoute"
import adminRoute from "./routes/adminRoute"

require('dotenv').config()

const exphbs = require("express-handlebars")
const handlebars = require("handlebars")
const layouts = require("handlebars-layouts")
handlebars.registerHelper(layouts(handlebars))

const app = express();

let server
server = http.createServer(app)

//#region MongoDB connect
mongoose.Promise = global.Promise;
mongoose
  .connect(process.env.DB, { useNewUrlParser: true })
  .then(() => console.log("Database connected successfully"))
  .catch(err => console.log(err));

mongoose.set("debug", true);
//#endregion

//#region set cross origin
const allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // intercept OPTIONS method
  if ("OPTIONS" == req.method) {
    res.send(200);
  } else {
    next();
  }
};
app.use(allowCrossDomain);
//#endregion

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//#region  hbs setup
var hbs = exphbs.create({
  extname: '.hbs', //we will be creating this layout shortly
  helpers: {
    inc :function(value, options){
      return parseInt(value) + 1;
    },
      if_eq: function (a, b, opts) {
        if (a == b) // Or === depending on your needs
          return opts.fn(this);
        else
          return opts.inverse(this);
      },
      if_neq: function (a, b, opts) {
        if (a != b) // Or === depending on your needs
          return opts.fn(this);
        else
          return opts.inverse(this);
      },
      inArray: function(array, value, block) {
        if (array.indexOf(value) !== -1) {
          return block.fn(this);
        }
        else {
          return block.inverse(this);
        }
      },
  
      for: function(from, to, incr, block) {
        var accum = 0;
        for(var i = from; i < to; i += incr)
            accum += block.fn(i);
        return accum;
      },
      total_price: function(v1, v2) {
        return v1 * v2;
      },
      ternary: (exp, ...a) => {
        return eval(exp);
      },
      eq: function (v1, v2) {
          return v1 == v2;
      },
      ne: function (v1, v2) {
          return v1 !== v2;
      },
      lt: function (v1, v2) {
          return v1 < v2;
      },
      gt: function (v1, v2) {
          return v1 > v2;
      },
      lte: function (v1, v2) {
          return v1 <= v2;
      },
      gte: function (v1, v2) {
          return v1 >= v2;
      },
      and: function (v1, v2) {
          return v1 && v2;
      },
      or: function (v1, v2) {
          return v1 || v2;
      },
      dateFormat: require('handlebars-dateformat'),
      inc: function(value, options) {
        return parseInt(value) + 1;
      },
      perc: function(value, total, options) {
          return Math.round((parseInt(value) / parseInt(total) * 100) * 100) / 100;
      },
      img_src: function(value, options) {
        if (fs.existsSync("public/events/"+value) && value != "") {
          return "/events/"+value;
        }
        else {
          return "/admin/assets/img/pattern-cover.png";
        }
      },
  
      events: function() {
        return Event.find({}, { event_name: 1 }).map(function (event) {
          return event
        });
      },
      profile_src: function(value, options) {
        if (fs.existsSync("public/profile/"+value) && value != "") {
          return "/profile/"+value;
        }
        else {
          return "/admin/assets/img/pattern-cover.png";
        }
      },
      product_img: function(value, options) {
        if (fs.existsSync("public/product/"+value) && value != "") {
          return "/product/"+value;
        }
        else {
          return "/admin/assets/img/pattern-cover.png";
        }
      },
      formatCurrency: function(value) {
        return value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
      },
      twoDecimalPoint: function(value){
          return parseFloat(Math.round(value * 100) / 100).toFixed(2);  
      },
      fiveDecimalPoint: function(value){
        return parseFloat(Math.round(value * 100) / 100).toFixed(5);
      },
      nFormatter: function (num, digits) {
        var si = [{
            value: 1,
            symbol: ""
          },
          {
            value: 1E3,
            symbol: "k"
          },
          {
            value: 1E6,
            symbol: "M"
          },
          {
            value: 1E9,
            symbol: "B"
          },
          {
            value: 1E12,
            symbol: "T"
          },
          {
            value: 1E15,
            symbol: "P"
          },
          {
            value: 1E18,
            symbol: "E"
          }
        ];
        var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        var i;
        for (i = si.length - 1; i > 0; i--) {
          if (num >= si[i].value) {
            break;
          }
        }
        return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
      },
      toLowerCase: function(value){
        return value.toLowerCase();
      },
      toUpperCase: function(value){
        return value.toUpperCase();
      },
      checkCurrencies: function(value, arr) {
        var tempArr = lodash.filter(arr, x => x.Currency.alt_name === value);
        //return tempArr.length > 0 ? tempArr[0].balance : '';
        return tempArr.length > 0 ? tempArr[0].balance : '0.00';
      },
      checkAnswer: function(value, arr) {
        var tempArr = lodash.filter(arr, x => x.option_id === value);
        return tempArr.length > 0 ? true : false;
      },
      getUploadedFileExtension: function(value){
  
        if(value != null){
          return value.substr(value.lastIndexOf('.') + 1);
        }
        
      },
  
      multiple_if: function(){
        const args = Array.prototype.slice.call(arguments, 0, -1);
        return args.every(function (expression) {
            return args[0] === expression;
        });
      },
      empty_array: function(arr, opts) {
        if (arr.length <= 0)
          return opts.fn(this);
        else
          return opts.inverse(this);
        
      },
      not_empty_array: function(arr, opts) {
        if (arr.length > 0)
          return opts.fn(this);
        else
          return opts.inverse(this);
      }
  }
});
//#endregion
app.engine('.hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json())
app.use(session({
	secret: 'W$q4=25*8%v-}UV',
	resave: false,
    saveUninitialized: true,
    cookie: {
        path: "/",
        // maxAge: 1800000
    },
    name: "id",
    ttl: (1* 60* 60)
})); // session secret
app.use(flash());

//#region load router
app.use('/api', userRoute)
app.use('/', adminRoute)
//#endregion

//====Port open to run application
server.listen(process.env.PORT, (err) => {
    if(err)
        throw err

    console.log(`you are server is running on ${process.env.PORT}`);
});
