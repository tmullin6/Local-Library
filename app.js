const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const lessMiddleware = require('less-middleware');
const logger = require('morgan');
const mongoose = require('mongoose');

//import code to handle routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog');
const compression = require('compression');
const helmet = require('helmet');

const app = express();

app.use(helmet());

//Set up connection to mongoDB cluster using connection string
const mongoDB='mongodb+srv://tmullin6:librarydb@library.pnox3.mongodb.net/local_library?retryWrites=true&w=majority';
mongoose.connect(mongoDB,{useNewUrlParser: true, useUnifiedTopology: true});

//Set up default connection
const db = mongoose.connection;

//Set up error handling for DB connection errors
db.on('error',console.error.bind(console,"MongoDB Connection Error"));

// Set 'views' value to the path to views directory
app.set('views', path.join(__dirname, 'views'));

//Set view engine to Embedded JavaScript (ejs) template
app.set('view engine', 'ejs');


//Add middleware to request handling chain
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(compression());

//Middleware to handle LESS preprocessor
app.use(lessMiddleware(path.join(__dirname, 'public')));

//Middleware that serves all static pages from public directory
app.use(express.static(path.join(__dirname, 'public')));

//Set up app to use the previously imported router code
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog',catalogRouter);

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
