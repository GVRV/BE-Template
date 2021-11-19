const { Op } = require("sequelize");

module.exports = {
  getUnpaidJobs: async (req, res) => {
    const { Contract, Job } = req.app.get("models");

    const unpaidJobs = await Job.findAll({
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
            [Op.or]: {
              ContractorId: req.profile.id,
              ClientId: req.profile.id,
            },
          },
        },
      ],
    });

    res.json(unpaidJobs);
  },
  jobPayment: async (req, res) => {
    const { Profile, Contract, Job } = req.app.get("models");

    // The currently logged in user should be a client
    // if they're trying to pay for a job
    let client = await Profile.findOne({
      where: {
        id: req.profile.id,
        // FIXME: This cannot be the best way to reference
        // type "client" without hard-coding the string
        type: Profile.rawAttributes.type.values[0],
      },
    });
    if (!client) {
      return res
        .status(400)
        .json({
          error: "Only clients can pay for jobs.",
        })
        .end();
    }

    // TODO: Ideally we should take care we're doing this in the
    // same database transaction as above so that client balance
    // could not have changed before we compare to the job amount
    let jobId = req.params.jobId;
    const job = await Job.findOne({
      where: {
        id: jobId,
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

    // If the job isn't found, we cannot accept a payment for it
    if (!job) {
      return res
        .status(400)
        .json({
          error: `You cannot make a payment for Job ${jobId} as you're not the client or the contract is terminated or the job is already paid.`,
        })
        .end();
    }

    // Check whether client has funds to pay for the job
    if (client.balance < job.price) {
      return res
        .status(400)
        .json({
          error: `You do not have sufficient funds to pay for Job ${jobId}.`,
        })
        .end();
    }

    // If all pre-conditions are fine, find the contractor for the job
    let contractor = await Profile.findOne({
      where: {
        id: job.Contract.ContractorId,
      },
    });

    if (!contractor) {
      return res
        .status(500)
        .json({
          error: `Contractor cannot be found for Contract ${job.contract.id} related to Job ${jobId}.`,
        })
        .end();
    }

    // Mark the job as paid
    job.paid = true;
    job.paymentDate = new Date();
    await job.save();

    // Decrease client balance
    client.balance -= job.price;
    await client.save();

    // Increase contractor balance
    contractor.balance += job.price;
    await contractor.save();

    res.status(200).json(job);
  },
};
