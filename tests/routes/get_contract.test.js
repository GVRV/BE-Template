const request = require("supertest");
const app = require("../../src/app");

describe("Get Contract API", () => {
  it("should error for unauthenticated users", async () => {
    const res = await request(app).get("/contracts/1");
    expect(res.statusCode).toEqual(401);
  });

  it("should return contract if authenticated user is a client", async () => {
    const res = await request(app).get("/contracts/1").set("profile_id", "1");
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(1);
  });

  it("should return contract if authenticated user is a contractor", async () => {
    const res = await request(app).get("/contracts/1").set("profile_id", "5");
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(1);
  });

  it("should error if authenticated user neither a contractor nor a client", async () => {
    const res = await request(app).get("/contracts/1").set("profile_id", "2");
    expect(res.statusCode).toEqual(404);
  });

  it("should error if contract does not exist", async () => {
    const res = await request(app).get("/contracts/0").set("profile_id", "5");
    expect(res.statusCode).toEqual(404);
  });
});
