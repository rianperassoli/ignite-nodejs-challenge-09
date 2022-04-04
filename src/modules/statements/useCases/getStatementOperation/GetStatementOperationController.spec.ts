import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuid } from "uuid"

import { app } from "../../../../app";

let connection: Connection;

describe("Get Statement Operation Controller", () => {
  let token = '';
  let user_id = '';
  let operation_id = '';
  const name = "User Test";
  const email = "test@email.com";
  const password = "12345";

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users/').send({
      name,
      email,
      password
    });

    const authResponse = await request(app).post('/api/v1/sessions/').send({
      email,
      password
    });

    token = authResponse.body.token;
    user_id = authResponse.body.user.id;

    const operationResponse = await request(app).post('/api/v1/statements/deposit').send({
      amount: 150.00,
      description: 'Deposit test'
    }).set({
      Authorization: `Bearer ${token}`,
    });

    operation_id = operationResponse.body.id
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get a statement operation", async () => {
    const response = await request(app).get(`/api/v1/statements/${operation_id}`).send().set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.user_id).toBe(user_id);
    expect(response.body.type).toBe('deposit');
    expect(response.body.amount).toBe("150.00");
  });

  it("should not be able to get a statement operation with invalid token", async () => {
    const response = await request(app).get(`/api/v1/statements/${operation_id}`).send().set({
      Authorization: `Bearer ${token}invalid token`,
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

  it("should not be able to get a statement operation with invalid operation ID", async () => {
    const response = await request(app).get(`/api/v1/statements/${uuid()}`).send().set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

});
