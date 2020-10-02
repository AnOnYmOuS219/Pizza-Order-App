const Order = require('../../../models/order')
function orderController(){
    return {
        async index(req, res){

            //find only non-completed orders
            // don't include password
            Order.find({ status: { $ne: 'completed' } }, 
            null, 
            {sort:{
                'createdAt': -1,
            }}
            ).populate('customerId', '-password').exec((err, orders)=>{
                if(req.xhr){
                    return res.json(orders)
                }
                return res.render('admin/orders', orders)
            }) 
            
        }
    }
}

module.exports = orderController