const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");
const { getProfile } = require("./middleware/getProfile");
const app = express();
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

const { Op } = require("sequelize");

/**
 *
 * @returns contract by id
 */
app.get("/contracts/:id", getProfile, async (req, res) => {
  const { Contract } = req.app.get("models");
  const { id } = req.params;

  const contract = await Contract.findOne({
    where: {
      id,
      [Op.or]: {
        ContractorId: req.profile.id,
        ClientId: req.profile.id,
      },
    },
  });

  if (!contract) return res.status(404).end();

  res.json(contract);
});

app.get("/contracts", getProfile, async (req, res) => {
    const { Contract } = req.app.get("models");

    const active_contracts = await Contract.findAll({
        where: {
            status: {
                // FIXME: This cannot be the best way to reference
                // status "terminated" without hard-coding the string
                [Op.ne]: Contract.rawAttributes.status.values[2]
            },
            [Op.or]: {
                ContractorId: req.profile.id,
                ClientId: req.profile.id,
            },
        },
    });

    res.json(active_contracts);
});

app.get("/jobs/unpaid", getProfile, async (req, res) => {
    const { Contract, Job } = req.app.get("models");

    const unpaid_jobs = await Job.findAll({
        where: {
            paid: {
                // FIXME: Why is sequelizing seeding with null values?
                [Op.or]: [false, null]
            }
        },
        include: [
            {
                model: Contract,
                where: {
                    status: {
                        // FIXME: This cannot be the best way to reference
                        // status "terminated" without hard-coding the string
                        [Op.ne]: Contract.rawAttributes.status.values[2]
                    },
                    [Op.or]: {
                        ContractorId: req.profile.id,
                        ClientId: req.profile.id,
                    },
                },
            }
        ]
    });

    res.json(unpaid_jobs);
});

module.exports = app;
