const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");
const { getProfile } = require("./middleware/getProfile");
const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

const { getContract, getAllContracts } = require("./routes/contract");
const { getUnpaidJobs, jobPayment } = require("./routes/job");
const { clientDeposit } = require("./routes/deposit");

/**
 * Contract Routes
 */
app.get("/contracts/:id", getProfile, getContract);
app.get("/contracts", getProfile, getAllContracts);

/**
 * Job Routes
 */
app.get("/jobs/unpaid", getProfile, getUnpaidJobs);
app.post("/jobs/:jobId/pay", getProfile, jobPayment);

/**
 * Deposit Routes
 */
app.post("/deposit/balances/:userId", clientDeposit);

module.exports = app;
