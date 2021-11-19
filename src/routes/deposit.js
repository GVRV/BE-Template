const { Op, fn, col } = require("sequelize");
const job = require("./job");

module.exports = {
  clientDeposit: async (req, res) => {
    const { Profile, Contract, Job } = req.app.get("models");

    let depositAmount;
    try {
      depositAmount = Number(req.body.amount);

      if (isNaN(depositAmount) || depositAmount < 0) {
        throw Error();
      }
    } catch (e) {
      return res
        .status(400)
        .json({
          error: "Deposit amount should be a positive number.",
        })
        .end();
    }

    // The currently logged in user should be a client
    // if they're trying to pay for a job
    let client = await Profile.findOne({
      where: {
        id: req.params.userId,
        // FIXME: This cannot be the best way to reference
        // type "client" without hard-coding the string
        type: Profile.rawAttributes.type.values[0],
      },
    });
    if (!client) {
      return res
        .status(400)
        .json({
          error: "Only clients can accept deposited funds.",
        })
        .end();
    }

    // TODO: Ideally we should take care we're doing this in the
    // same database transaction as above so that client balance
    // could not have changed before we compare to the job amount
    const unpaidJobs = await Job.findAll({
      attributes: [[fn("sum", col("price")), "total"]],
      where: {
        paid: {
          // FIXME: Why is sequelizing seeding with null values?
          [Op.or]: [false, null],
        },
      },
      include: [
        {
          model: Contract,
          where: {
            status: {
              // FIXME: This cannot be the best way to reference
              // status "terminated" without hard-coding the string
              [Op.ne]: Contract.rawAttributes.status.values[2],
            },
            ClientId: client.id,
          },
        },
      ],
    });

    let totalPayable = unpaidJobs[0].dataValues.total || 0;
    let depositLimit = totalPayable / 4;

    // Check whether client wants to deposit more than 25% of the
    // outstanding payable job prices
    if (depositAmount > depositLimit) {
      return res
        .status(400)
        .json({
          error: `You cannot deposit more than 25% of the outstanding job payments: ${totalPayable}.`,
        })
        .end();
    }

    // Increase client balance
    client.balance += depositAmount;
    await client.save();

    res.status(200).json(client);
  },
};
