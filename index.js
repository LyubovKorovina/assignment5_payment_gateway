const mongoose = require("mongoose");
const express = require("express");
const paypal = require("paypal-rest-sdk");

//**********Mangoose Database Start ***********//

//connecting our app to mangoose database
mongoose.connect('mongodb+srv://dbuser:avokado@lyubovk.egwftuw.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to database");
}).catch((error) => {
  console.error("Failed to connect to database", error);
});


//defining a structure of model for a Book
const bookSchema = new mongoose.Schema({
  name: String,
  author: String,
  price: Number,
  currency: String,
  quantity: Number
});

const Book = mongoose.model("Book", bookSchema);


//Create, Read, Update, and Delete (CRUD) Operations
const newBook = new Book({
  name: "Mobile Data Management",
  author: "Test1",
  price: 50.00,
  currency: "CAD",
  quantity: 10
});

newBook.save()
.then(() => {
  console.log("Book saved successfully");
})
.catch((error) => {
  console.error("Failed to save book", error);
});


//Close Database Connection
mongoose.connection.close()
.then(() => {
  console.log("Disconnected from database");
})
.catch((error) => {
  console.error("Failed to disconnect from database", error);
});

//**********Mangoose Database End ***********//


paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "ARXRj4rh-8znnzs_OrCws8T5Us-EOph3NT51a7b5z37K7Y4fbSF_RifyaT9bDj9kKp3-ZUPtRVR5AUun",
  client_secret:
    "EJP4CvPpZMEjmsK5vqwAD_mIZyCHe8eV62ylVYRzZld5oSHjjeB2S7-wNpi0G5l2KA_g_67_lN7Y_-2U",
});

const PORT = process.env.PORT || 3000;

const app = express();

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

app.post("/pay", (req, res) => {
  const create_payment_json = {
    intent: "Book Fair",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "https://paypalnode.com/success",
      cancel_url: "https://paypalnode.com/cancel",
    },
    transactions: [
      {
        books_list: {
          books: [
            {
              name: "Mobile Data Mangement",
              Author: "Test1",
              price: "50.00",
              currency: "CAD",
              quantity: 10,
            },
          ],
        },
        amount: {
          currency: "CAD",
          total: "500.00",
        },
        description: "Test description assignment5",
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "5.00",
        },
      },
    ],
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (
    error,
    payment
  ) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.send("Success");
    }
  });
});

app.get("/cancel", (req, res) => res.send("Cancelled"));

app.listen(PORT, () => console.log(`Server Started on ${PORT}`));