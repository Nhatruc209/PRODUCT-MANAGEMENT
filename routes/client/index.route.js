const productRoutes = require('./product.route');
const homeRoutes = require('./home.route');
const cartRoutes = require('./cart.route');
const checkoutRoutes = require('./checkout.route');
const userRoutes = require('./user.route');
const orderRoutes = require('./order.route');
const clientAuthMiddleware = require('../../middlewares/client/auth.middleware');

module.exports = (app) => {
    app.use(clientAuthMiddleware.infoUser);
    app.use("/", homeRoutes);
    app.use('/products', productRoutes);
    app.use('/cart', cartRoutes);
    app.use('/checkout', checkoutRoutes);
    app.use('/user', userRoutes);
    app.use('/orders', orderRoutes);
};
