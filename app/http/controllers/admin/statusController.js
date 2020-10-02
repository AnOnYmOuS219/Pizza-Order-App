const Order = require('../../../models/order')
function statusController(){

    return{
        update(req, res){
            const { status, orderId } = req.body
            Order.updateOne({_id: orderId}, { status: status }, (err, result) => {

                const eventEmitter = req.app.get('eventEmitter')  //get event
                eventEmitter.emit('orderUpdated', { id: orderId, status}) //emit event
                return res.redirect('/admin/orders')
            })
        }
    }
}

module.exports = statusController