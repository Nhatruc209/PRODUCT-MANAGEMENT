const express = require('express');
require('dotenv').config();
// Bên Be dùng require để nhúng routes, còn fe dùng import
const routes = require('./routes/client/index.route');


const app = express();
const port = process.env.PORT;

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('public'));
// Routers
routes(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});