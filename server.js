require('dotenv').config()
const express = require('express')
const ejs = require('ejs')
const expressLayout = require('express-ejs-layouts')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 3300
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const mongoDBStore = require('connect-mongo')(session)
const passport = require('passport')
const Emitter = require('events') 


// Database Connection
const url = 'mongodb://localhost/pizza'
mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true, 
    useFindAndModify: true
}) 
const connection = mongoose.connection
connection.once('open', ()=>{
    console.log('Database connected ...')
}).catch(err =>{
    console.log('Connection failed ...')
})




// Session Store
let mongoStore = new mongoDBStore({
    mongooseConnection: connection,
    collection: 'sessions',

})


// Event Emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)  //bind with app to let anything access it


// Session config (uses cookies - encrypted)
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore,  //now sessions would get stored in DB rather than in memory
    cookie: {maxAge: 1000 * 60 * 60 * 24}  //24 hrs 
}))

// Passport config should be after session config 
const passportInit = require('./app/config/passport')
const { Socket } = require('dgram')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

// Assets
app.use(express.static('public'))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//Global Middleware
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

// set template engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine', 'ejs')

require('./routes/web')(app)


const server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

// SOCKET

const io = require('socket.io')(server)
io.on('connection', (socket) =>{
     socket.on('join', (orderId)=>{
        socket.join(orderId) // private rooms
     })

})

eventEmitter.on('orderUpdated', (data)=>{
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})
eventEmitter.on('orderPlaced', (data)=>{
    io.to(`adminRoom`).emit('orderPlaced', data)
})