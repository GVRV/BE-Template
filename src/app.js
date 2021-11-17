const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");
const { getProfile } = require("./middleware/getProfile");
const app = express();
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

const { getContract, getAllContracts } = require('./routes/contract');
const { getUnpaidJobs } = require('./routes/job');

/**
 * Contract Routes
 */
app.get("/contracts/:id", getProfile, getContract);
app.get("/contracts", getProfile, getAllContracts);

/**
  * Job Routes
  */
app.get("/jobs/unpaid", getProfile, getUnpaidJobs);

module.exports = app;
