const mongoose = require("mongoose");
const express = require("express");
const paypal = require('paypal-rest-sdk');
const order = require("./orderModel");
const orderModel = require("./orderModel");

const mode = "sandbox";
const client_id = "ARXRj4rh-8znnzs_OrCws8T5Us-EOph3NT51a7b5z37K7Y4fbSF_RifyaT9bDj9kKp3-ZUPtRVR5AUun";
const client_secret = "EJP4CvPpZMEjmsK5vqwAD_mIZyCHe8eV62ylVYRzZld5oSHjjeB2S7-wNpi0G5l2KA_g_67_lN7Y_-2U";

paypal.configure({
  mode: mode,
  client_id: client_id,
  client_secret: client_secret
});

const PORT = process.env.PORT || 3000;

const app = express();



//**********Mangoose Database Start ***********//

//connecting our app to mangoose database
mongoose.connect('mongodb+srv://elkay:superpwd@lyubovk.egwftuw.mongodb.net/?retryWrites=true&w=majority', {
}).then(() => {
  console.log("Connected to database");
}).catch((error) => {
  console.error("Failed to connect to database", error);
});


app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

app.post("/pay", (req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    },
    transactions: [
      {
        books_list: {
          books: [
            {
              name: "Mobile Data Mangement",
              Author: "Test1",
              price: "50.00",
              currency: "USD",
              quantity: 10,
            },
          ],
        },
        amount: {
          currency: "USD",
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
      orderModel.create({        
        Amount : 500,
        Quantity: 10,
        PaymentIntenId: payment.id,
        PaymentMethod: payment.payer.payment_method,
        IsCaptured : false
      })
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
          total: "500",
        },
      },
    ],
  };

  paypal.payment.get(paymentId, {}, async (error, order) => {

    if (error) {
      console.log(error);

      throw error;
    } else {
      let myOrder = await orderModel.findOne({ PaymentIntenId: paymentId });

      if (order.payer.status === "VERIFIED") {    
        const execute_payment_json = {
          payer_id: payerId,
          transactions: [
            {
              amount: {
                currency: "USD",
                total: myOrder.Amount,
              },
            },
          ],
        };
        
        // capture the payment and transfer the amount
        paypal.payment.execute(paymentId, execute_payment_json, function (
          error,
          payment
        ) {
          if (error) {

            console.log(error.response);

            throw error;
          } else {

            myOrder.IsCaptured = true
            myOrder.save()
            res.status(200).json({"success" : true, "message": "Your payment is recieved", "Home" : `http://localhost/3000`})
          }
        });
      }
    }
  })
});

app.get("/cancel", (req, res) => res.status(200).json({"success" : false, "message": "Your payment is declined", "Home" : `http://localhost/3000`}));

app.listen(PORT, () => console.log(`Server Started on ${PORT}`));