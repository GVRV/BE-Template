const request = require("supertest");
const app = require("../../src/app");

describe("Get Contracts API", () => {
    it("should error for unauthenticated users", async () => {
        const res = await request(app).get("/contracts");
        expect(res.statusCode).toEqual(401);
    });

    it("should return non-terminated contracts if authenticated user is a client", async () => {
        const res = await request(app).get("/contracts").set("profile_id", "1");
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toEqual(1);
        expect(res.body[0].id).toEqual(2);
        expect(res.body[0].status).not.toEqual("terminated");
    });

    it("should return non-terminated contracts if authenticated user is a contractor", async () => {
        const res1 = await request(app).get("/contracts").set("profile_id", "5");
        expect(res1.statusCode).toEqual(200);
        expect(res1.body.length).toEqual(0);

        const res2 = await request(app).get("/contracts").set("profile_id", "6");
        expect(res2.statusCode).toEqual(200);
        expect(res2.body.length).toEqual(3);

        for (contract of res2.body) {
            expect(contract.status).not.toEqual("terminated");
        }
    });
});
