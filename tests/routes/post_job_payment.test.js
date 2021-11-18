const request = require("supertest");
const app = require("../../src/app");

describe("Post Job Payment API", () => {
  it("should error for unauthenticated users", async () => {
    const res = await request(app).post("/jobs/1/pay");
    expect(res.statusCode).toEqual(401);
  });

  it("should return an error if the currently authenticated user is not a client", async () => {
    const res = await request(app).post("/jobs/1/pay").set("profile_id", "5");
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual("Only clients can pay for jobs.");
  });

  it("should return an error if the client doesn't have a unpaid job on an active contract with the passed job ID", async () => {
    const res = await request(app).post("/jobs/1/pay").set("profile_id", "1");
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual(
      "You cannot make a payment for Job 1 as you're not the client or the contract is terminated or the job is already paid."
    );

    const res2 = await request(app).post("/jobs/4/pay").set("profile_id", "1");
    expect(res2.statusCode).toEqual(400);
    expect(res2.body.error).toEqual(
      "You cannot make a payment for Job 4 as you're not the client or the contract is terminated or the job is already paid."
    );

    const res3 = await request(app).post("/jobs/12/pay").set("profile_id", "1");
    expect(res3.statusCode).toEqual(400);
    expect(res3.body.error).toEqual(
      "You cannot make a payment for Job 12 as you're not the client or the contract is terminated or the job is already paid."
    );
  });

  it("should return an error if the client doesn't have balance to pay for the job", async () => {
    const res = await request(app).post("/jobs/5/pay").set("profile_id", "4");
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual(
      "You do not have sufficient funds to pay for Job 5."
    );
  });

  it("should successfully move funds from the client to the contractor and mark the job as paid", async () => {
    const res = await request(app).post("/jobs/2/pay").set("profile_id", "1");
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toBe(2);
    expect(res.body.paid).toBe(true);
  });
});
