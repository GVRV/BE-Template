const request = require("supertest");
const app = require("../../src/app");

describe("Get Unpaid Jobs API", () => {
  it("should error for unauthenticated users", async () => {
    const res = await request(app).get("/jobs/unpaid");
    expect(res.statusCode).toEqual(401);
  });

  it("should return non-paid jobs associated with active contracts if authenticated user is a client", async () => {
    const res = await request(app).get("/jobs/unpaid").set("profile_id", "1");
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0].id).toEqual(2);
    expect(res.body[0].paid).not.toEqual(true);
  });

  it("should return non-paid jobs associated with active contracts if authenticated user is a contractor", async () => {
    const res = await request(app).get("/jobs/unpaid").set("profile_id", "6");
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(2);
    expect(res.body[0].id).toEqual(2);
    expect(res.body[0].paid).not.toEqual(true);
    expect(res.body[1].id).toEqual(3);
    expect(res.body[1].paid).not.toEqual(true);
  });

  it("should return empty list if there no unpaid jobs for authenticated user's active contracts", async () => {
    const res = await request(app).get("/jobs/unpaid").set("profile_id", "5");
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(0);
  });
});
