const Order = require('../../../models/order')
const moment = require('moment')
function orderController(){
    return {
        store(req, res){
            const { phone, address } = req.body
            if( !phone || !address ){
                req.flash('error', 'All fields are required')
                return res.redirect('/cart')
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone,
                address, 
            })
            order.save().then( result =>{

                Order.populate(result, { path: 'customerId' }, (err, placedOrder)=>{

                    //populate so that admin socket can fetch customer object 
                    req.flash('success', 'Order placed successfully!')
                    delete req.session.cart
                    //event emitter
                    const eventEmitter = req.app.get('eventEmitter')  //get event
                    eventEmitter.emit('orderPlaced', placedOrder) //emit event
                    return res.redirect('/customer/orders')
                })
               
                
            }).catch(err => {
                req.flash('error', 'Something went wrong')
                return res.redirect('/cart')
            })
        },
        async index(req, res){
            const orders = await Order.find({ customerId: req.user._id },
                null,
                {sort: {
                    'createdAt': -1,
                }}
                )  //array of objects

            // don't use cache for flash messages on click-back button    
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
            res.render('customers/orders', { orders, moment })
        },
        async show(req, res){
            const order = await Order.findById(req.params.id)

            //user authorized?
            if(req.user._id.toString() === order.customerId.toString()){
                return res.render('customers/singleOrder', { order })
            }
            res.redirect('/')
        }
    }
}

module.exports = orderController