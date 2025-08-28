import { describe, expect, it, test } from "vitest";
import axios from "axios";

const BACKEND_URL = "http://localhost:8080";

const PHONE_NO_1 = "1234567890";
const NAME_1 = "Gopal";

describe("Signup endpoints", () => {
  it("Double signup doesnot work", async () => {
    const response1 = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      Number: PHONE_NO_1,
      name: NAME_1,
    });

    const response2 = await axios.post(`${BACKEND_URL}/api/v1/signup/verify`, {
      name: NAME_1,
      otp: "1234",
    });

    expect(response1.status).toBe(201);
      expect(response2.status).toBe(200);
      expect(response1.data.id).not.toBeNull()

    expect(async () => {
      await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        Number: PHONE_NO_1,
        name: NAME_1,
      });
    }).toThrow();
  
  
  });
    
});
