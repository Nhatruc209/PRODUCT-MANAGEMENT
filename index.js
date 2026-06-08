const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
require('dotenv').config();

const database = require('./config/database');

database.connect();

// Bên Be dùng require để nhúng routes, còn fe dùng import
const routeAdmin = require('./routes/admin/index.route');
const routes = require('./routes/client/index.route');

const systemConfig = require('./config/system');
const formatCurrency = require('./helpers/formatCurrency');

const app = express();
const port = process.env.PORT || 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("SESSION_SECRET is required");
}

app.use(cookieParser(sessionSecret));
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}));
app.use(flash());

// Ensure currency formatter is always available to every rendered view.
app.use((req, res, next) => {
  res.locals.formatCurrency = formatCurrency;
  next();
});

app.set('views', './views');
app.set('view engine', 'pug');
// APP LOCAL VARIABLES
app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.locals.formatCurrency = formatCurrency;


app.use(express.static('public'));
// Routers
routeAdmin(app);
routes(app);  


app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
