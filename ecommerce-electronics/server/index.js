const dotenv = require('dotenv');
const express = require("express");
const { default: mongoose } = require("mongoose");
const routes = require('./routes');
const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser')
const cors = require('cors');
dotenv.config()

const app = express()
const port = process.env.PORT || 3001
app.use(cors({
    origin: 'http://localhost:3000', // domain client
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(bodyParser.json())
app.use(cookieParser())

routes(app);

mongoose.connect(`${process.env.MONGO_DB}`)
    .then(() => console.log('Connect Db success!'))
    .catch((err) => console.error(err));


app.listen(port, () => {
    console.log('Server is running in port:' + port)
})