const express = require("express");
const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "ARXRj4rh-8znnzs_OrCws8T5Us-EOph3NT51a7b5z37K7Y4fbSF_RifyaT9bDj9kKp3-ZUPtRVR5AUun",
  client_secret:
    "EJP4CvPpZMEjmsK5vqwAD_mIZyCHe8eV62ylVYRzZld5oSHjjeB2S7-wNpi0G5l2KA_g_67_lN7Y_-2U",
});

const router = express.Router();

router.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

router.post("/pay", (req, res) => {
  // Route handler for /pay
  // ...
});

router.get("/success", (req, res) => {
  // Route handler for /success
  // ...
});

router.get("/cancel", (req, res) => res.send("Cancelled"));

module.exports = router;