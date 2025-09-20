import { describe, expect, it } from "vitest";
import { axios } from "./axios";
import { getRandomNumber } from "./utils/number";

const BACKEND_URL = "http://localhost:8080";

const PHONE_NUMBER_1 = getRandomNumber(10);
const NAME_1 = "gopal";

describe("Signin endpoints", () => {
  it("Signin doesnt work for user who doesnt exist in db", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/admin/signin`, {
      phoneNumber: PHONE_NUMBER_1.toString(),
    });
    expect(response.status).toBe(404);
  });

  it("Signin works for admin", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/test/create-test-admin`,
      {
        phoneNumber: PHONE_NUMBER_1.toString(),
        name: NAME_1,
      }
    );

    const responseSignin = await axios.post(
      `${BACKEND_URL}/api/v1/admin/signin`,
      {
        phoneNumber: PHONE_NUMBER_1.toString(),
      }
    );

    expect(response.status).toBe(201);
    expect(response.data.token).not.toBeNull();
    expect(responseSignin.status).toBe(200);
    expect(responseSignin.data.token).not.toBeNull();
  });
});
