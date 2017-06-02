const express        = require('express'),
      path           = require('path'),
      favicon        = require('serve-favicon'),
      logger         = require('morgan'),
      cookieParser   = require('cookie-parser'),
      bodyParser     = require('body-parser'),
      expressHbs     = require('express-handlebars'),
      mongoose       = require('mongoose'),
      session        = require('express-session'),
      passport       = require('passport'),
      flash          = require('connect-flash'),
      validator      = require('express-validator'),
      MongoStore     = require('connect-mongo')(session);


const app = express();


/*require('./auth/passport');*/

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// set static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(validator());
app.use(cookieParser());
// Express Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false, 
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 60 * 60 * 1000 } // 1h
}));
// initialize passport
app.use(passport.initialize());
app.use(passport.session());
// Connect Flash
app.use(flash());
// Global Vars
app.use((req, res, next)=> {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
});



// import routes
app.use('/user', require('./routes/user'));
app.use('/', require('./routes/index'));



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



// initialize  mongo_db
mongoose.connect(process.env.MONGODB_URI);

module.exports = app;
