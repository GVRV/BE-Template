const request = require("supertest");
const app = require("../../src/app");

describe("Get Best Clients API", () => {
  it("should return best clients with default limit of 2", async () => {
    const res = await request(app).get(
      "/admin/best-clients?start=2001-01-01&end=2030-01-01"
    );
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(2);
    expect(res.body[0].id).toEqual(4);
    expect(res.body[0].paid).toEqual(2020);
    expect(res.body[1].id).toEqual(2);
    expect(res.body[1].paid).toEqual(442);
  });

  it("should return best clients with a limit if passed in", async () => {
    const res = await request(app).get(
      "/admin/best-clients?start=2001-01-01&end=2030-01-01&limit=5"
    );
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(4);
    expect(res.body[0].id).toEqual(4);
    expect(res.body[0].paid).toEqual(2020);
    expect(res.body[1].id).toEqual(2);
    expect(res.body[1].paid).toEqual(442);
  });

  it("should return errors on invalid parameters", async () => {
    const res = await request(app).get(
      "/admin/best-clients?start=wut&end=2030-01-01&limit=5"
    );
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual("Please enter valid start date.");

    const res2 = await request(app).get(
      "/admin/best-clients?start=2001-01-01&end=wut&limit=5"
    );
    expect(res2.statusCode).toEqual(400);
    expect(res2.body.error).toEqual("Please enter valid end date.");

    const res3 = await request(app).get(
      "/admin/best-clients?start=2001-01-01&end=2030-01-1&limit=wut"
    );
    expect(res3.statusCode).toEqual(400);
    expect(res3.body.error).toEqual("Please enter a valid limit.");
  });
});
