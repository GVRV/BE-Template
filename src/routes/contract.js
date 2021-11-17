const { Op } = require("sequelize");

module.exports = {
    getContract: async (req, res) => {
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
    },
    getAllContracts: async (req, res) => {
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
    }
}
