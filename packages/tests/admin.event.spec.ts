import { describe, expect, it, test } from "vitest";
import { axios } from "./axios";

const BACKEND_URL = "http://localhost:8080";
const PHONE_NO_1 = "1234567890";
const NAME_1 = "Gopal";

describe("events", () => {

     it("Can't create an event without right location", async () => {

       const response = await axios.post(`${BACKEND_URL}/api/v1/event/create`, {
         name: "Test Event",
         description: "This is a test event",
         banner: "http://example.com/banner.jpg",
         startTime: new Date().toISOString(),
         locationId: "random",
       });

       expect(response.status).toBe(400);
     });


  it("Can create an event with right location", async () => {
    const locationResponse = await axios.post(
      `${BACKEND_URL}/api/v1/location/create`,
      {
        name: "Delhi",
        description: "Capital of India",
        imageUrl:
          "https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg",
      }
    );

    const response = await axios.post(`${BACKEND_URL}/api/v1/event/create`, {
      name: "Test Event",
      description: "This is a test event",
      banner: "http://example.com/banner.jpg",
      startTime: new Date().toISOString(),
      locationId: locationResponse.data.id,
    });

    expect(response.status).toBe(201);
    expect(response.data.id).not.toBeNull();
  });
});
