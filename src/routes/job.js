const { Op } = require("sequelize");

module.exports = {
    getUnpaidJobs: async (req, res) => {
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
    }
}
