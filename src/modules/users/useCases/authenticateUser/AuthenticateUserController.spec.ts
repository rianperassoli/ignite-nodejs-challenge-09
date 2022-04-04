import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users/').send({
      name: "User Test",
      email: "test@email.com",
      password: "12345",
    });

  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate an user existent", async () => {
    const response = await request(app).post('/api/v1/sessions/').send({
      email: "test@email.com",
      password: "12345",
    });

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('token')
    expect(response.body).toHaveProperty('user')
  })

  it("should not be able to authenticate an existent user with wrong password", async () => {
    const response = await request(app).post('/api/v1/sessions/').send({
      email: "test@email.com",
      password: "wrong password",
    });

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('message')
  })

  it("should not be able to authenticate an non existent user", async () => {
    const response = await request(app).post('/api/v1/sessions/').send({
      email: "wrong@email.com.br",
      password: "12345",
    });

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('message')
  })

})
