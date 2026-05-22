const express = require('express');
// Bên Be dùng require để nhúng routes, còn fe dùng import
const routes = require('./routes/client/index.route');

const app = express();
const port = 3000;

app.set('views', './views');
app.set('view engine', 'pug');

// Routers
routes(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});