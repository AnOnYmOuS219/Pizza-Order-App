import axios from 'axios'
import Noty from 'noty'
import {initAdmin} from './admin'

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')

function updateCart(pizza){
    //send request to server
    axios.post('/update-cart', pizza).then(res => {
        cartCounter.innerText = res.data.totalQty
        new Noty({
            type: "success",
            timeout: 1000,
            progressBar: false,
            text: 'Item added to cart!'
        }).show()
    }).catch(err => {
        new Noty({
            type: "error",
            timeout: 1000,
            progressBar: false,
            text: 'Something went wrong!'
        }).show()
    })
}

addToCart.forEach(btn => {
    btn.addEventListener('click', (e)=>{
        let pizza = JSON.parse(btn.dataset.pizza)
        updateCart(pizza)
    })
})

const orderAlert = document.querySelector('#success-alert')
if(orderAlert){
    setTimeout(()=>{
        orderAlert.remove()
    }, 2000)
}

initAdmin()