import { describe, expect, it, test } from "vitest";
import { axios } from "./axios";

const BACKEND_URL = "http://localhost:8080";
const PHONE_NO_1 = "1234567890";
const NAME_1 = "Gopal";

describe("User Signup endpoints", () => {
  it("User Signup amd verify", async () => {
    const response1 = await axios.post(`${BACKEND_URL}/api/v1/admin/signup`, {
      phoneNumber: PHONE_NO_1,
    });

    const response2 = await axios.post(
      `${BACKEND_URL}/api/v1/admin/signup/verify`,
      {
        phoneNumber: PHONE_NO_1,
        name: NAME_1,
        totp: "000000",
      }
    );

    expect(response1.status).toBe(201);
    expect(response2.status).toBe(200);
    expect(response1.data.id).not.toBeNull();
    expect(response2.data.token).not.toBeNull();
  });
});

describe("User Signin endpoints", () => {
  it("Signin works", async () => {
    const response1 = await axios.post(`${BACKEND_URL}/api/v1/admin/signin`, {
      phoneNumber: PHONE_NO_1,
    });

    const response2 = await axios.post(
      `${BACKEND_URL}/api/v1/admin/signin/verify`,
      {
        phoneNumber: PHONE_NO_1,
        totp: "000000",
      }
    );

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
    expect(response2.data.token).not.toBeNull();
  });

  it("Signin doesnt work for user who doesnt exist in db", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/admin/signin`, {
      number: PHONE_NO_1 + "123",
    });
    expect(response.status).toBe(400);
  });
});
