import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("Show User Profile Controller", () => {
  const name = "User Test"
  const email = "test@email.com"
  const password = "12345"

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users/').send({
      name,
      email,
      password
    });

  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to list the profile of an user existent", async () => {
    const authResponse = await request(app).post('/api/v1/sessions/').send({
      email,
      password
    });

    const response = await request(app).get('/api/v1/profile/').send().set({
      Authorization: `Bearer ${authResponse.body.token}`,
    });

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('id')
    expect(response.body.email).toBe(email)
    expect(response.body.name).toBe(name)
  })

  it("should not be able to show a profile with header invalid token", async () => {
    const response = await request(app).get('/api/v1/profile/').send().set({
      Authorization: `Bearer invalid-token`,
    });

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('message')
  })

})
