const { Op, fn, col } = require("sequelize");
const job = require("./job");

module.exports = {
  bestProfessionals: async (req, res) => {
    const { Profile, Contract, Job } = req.app.get("models");

    let startDate = new Date(req.query.start);
    if (isNaN(startDate)) {
      return res
        .status(400)
        .json({
          error: "Please enter valid start date.",
        })
        .end();
    }

    let endDate = new Date(req.query.end);
    if (isNaN(endDate)) {
      return res
        .status(400)
        .json({
          error: "Please enter valid end date.",
        })
        .end();
    }

    let query = {
      attributes: [
        [col("Contract.ContractorId"), "contractorId"],
        [fn("sum", col("price")), "total"],
      ],
      group: ["Contract.ContractorId"],
      where: {
        paid: true,
        paymentDate: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      },
      include: [
        {
          model: Contract,
          include: [
            {
              model: Profile,
              as: "Contractor",
              where: {
                id: col("Contract.ContractorId"),
              },
            },
          ],
        },
      ],
      order: [[col("total"), "DESC"]],
    };

    let contractorQuery = await Job.findAll(query);
    let bestContractors = [];

    for (let contractor of contractorQuery) {
      bestContractors.push({
        id: contractor.dataValues.contractorId,
        fullName: `${contractor.dataValues.Contract.dataValues.Contractor.dataValues.firstName} ${contractor.dataValues.Contract.dataValues.Contractor.dataValues.lastName}`,
        earned: contractor.dataValues.total,
      });
    }

    res.status(200).json(bestContractors);
  },
  bestClients: async (req, res) => {
    const { Profile, Contract, Job } = req.app.get("models");

    let startDate = new Date(req.query.start);
    if (isNaN(startDate)) {
      return res
        .status(400)
        .json({
          error: "Please enter valid start date.",
        })
        .end();
    }

    let endDate = new Date(req.query.end);
    if (isNaN(endDate)) {
      return res
        .status(400)
        .json({
          error: "Please enter valid end date.",
        })
        .end();
    }

    let limit = Number(req.query.limit || 2);
    if (isNaN(limit)) {
      return res.status(400).json({
        error: "Please enter a valid limit.",
      });
    }

    let query = {
      attributes: [
        [col("Contract.ClientId"), "clientId"],
        [fn("sum", col("price")), "total"],
      ],
      group: ["Contract.ClientId"],
      where: {
        paid: true,
        paymentDate: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      },
      include: [
        {
          model: Contract,
          include: [
            {
              model: Profile,
              as: "Client",
              where: {
                id: col("Contract.ClientId"),
              },
            },
          ],
        },
      ],
      order: [[col("total"), "DESC"]],
      limit,
    };

    let clientQuery = await Job.findAll(query);
    let bestClients = [];

    for (let client of clientQuery) {
      bestClients.push({
        id: client.dataValues.clientId,
        fullName: `${client.dataValues.Contract.dataValues.Client.dataValues.firstName} ${client.dataValues.Contract.dataValues.Client.dataValues.lastName}`,
        paid: client.dataValues.total,
      });
    }

    res.status(200).json(bestClients);
  },
};
