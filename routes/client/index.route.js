const productRoutes = require('./product.route');
const homeRoutes = require('./home.route');
// Nhúng routes xài module.exports
module.exports = (app) => {
    app.use("/", homeRoutes);

    app.use('/products', productRoutes);
};
