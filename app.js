var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var stylus = require('stylus');
var sessions = require('express-session');
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
const regRouter = require('./routes/reg')
const mainRouter = require('./routes/main');
const log = require('./components/log_comp');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(sessions({
    secret:'dsvdvfdbdfbfd',
    resave: false,
    saveUninitialized: false}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect("mongodb://localhost:27017/test_db", { useNewUrlParser: true }, function(err){
    if(err){
        let error_time = new Date();
        log.connect_mongo(error_time, "mongodb://localhost:27017/test_db", false);
        log.base_err(error_time,err);
    }
    else
        log.connect_mongo(new Date(), "mongodb://localhost:27017/test_db",true);

});
app.use('/reg', regRouter);
app.use('/auth', authRouter);
app.use('/main', mainRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
