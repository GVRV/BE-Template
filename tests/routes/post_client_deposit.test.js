const request = require("supertest");
const app = require("../../src/app");

describe("Post Client Deposit API", () => {
    it("should error for negative amounts", async () => {
        const res = await request(app).post("/deposit/balances/1").send({ "amount": -1 });
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toEqual("Deposit amount should be a positive number.");
    });

    it("should error for non-numeric values", async () => {
        const res = await request(app).post("/deposit/balances/1").send({ "amount": "wut" });
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toEqual("Deposit amount should be a positive number.");
    });

    it("should error for contractors", async () => {
        const res = await request(app).post("/deposit/balances/5").send({"amount": 1});
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toEqual("Only clients can accept deposited funds.");
    });

    it("should error if clients want to deposit more than 25% of unpaid job prices", async () => {
        const res = await request(app).post("/deposit/balances/2").send({ "amount": 101 });
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toEqual("You cannot deposit more than 25% of the outstanding job payments: 402.");
    });

    it("should successfully deposit funds into the client balance", async () => {
        const res = await request(app).post("/deposit/balances/2").send({ "amount": 100 });
        expect(res.statusCode).toEqual(200);
        expect(res.body.id).toEqual(2);
        expect(res.body.balance).toEqual(331.11);
    });

});
