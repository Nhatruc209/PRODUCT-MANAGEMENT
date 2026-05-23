const express = require('express');
require('dotenv').config();

const database = require('./config/database');

database.connect();

// Bên Be dùng require để nhúng routes, còn fe dùng import
const routeAdmin = require('./routes/admin/index.route');
const routes = require('./routes/client/index.route');

const app = express();
const port = process.env.PORT;

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('public'));
// Routers
routeAdmin(app);
routes(app);


app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});