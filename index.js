const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs-extra')
const fileUpload = require('express-fileupload')
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.u1hqo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('serviceIcon'))
app.use(fileUpload())

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('we are working')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("washy").collection("service");
  const reviewCollection = client.db("washy").collection("review");
  const adminCollection = client.db("washy").collection("admin");
  const orderCollection = client.db("washy").collection("order");


  app.post('/addService', (req, res) => {
    const icon = req.files.icon;
    const title = req.body.title;
    const description = req.body.description;

    const newImg = icon.data
    const encImg = newImg.toString('base64')
    var image = {
      contentType: icon.mimetype,
      size: icon.size,
      img: Buffer.from(encImg, 'base64')
    }

    serviceCollection.insertOne({ title, description, icon })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })


  app.get('/services', (req, res) => {
    serviceCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });


  app.post('/reviews', (req, res) => {
    const newReview = req.body;

    reviewCollection.insertOne(newReview)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/reviews', (req, res) => {
    reviewCollection.find({}).limit(6)
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.post('/admins', (req, res) => {
    const newAdmin = req.body;

    adminCollection.insertOne(newAdmin)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })


  app.get('/admins', (req, res) => {
    adminCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })


  app.post('/orders', (req, res) => {
    const newOrder = req.body;

    orderCollection.insertOne(newOrder)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/orders', (req, res) => {
    orderCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })



});


app.listen(port)