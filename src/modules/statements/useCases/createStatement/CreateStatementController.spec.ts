import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("Create Statement Controller", () => {
  let token = '';
  let user_id = '';
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
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should not be able to create a withdraw with no balance", async () => {
    const response = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 900.00,
      description: 'Withdraw test'
    }).set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  it("should be able to create a deposit", async () => {
    const response = await request(app).post('/api/v1/statements/deposit').send({
      amount: 150.00,
      description: 'Deposit test'
    }).set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.user_id).toBe(user_id);
    expect(response.body.type).toBe('deposit');
  })

  it("should be able to create a withdraw", async () => {
    await request(app).post('/api/v1/statements/deposit').send({
      amount: 150.00,
      description: 'Deposit test'
    }).set({
      Authorization: `Bearer ${token}`,
    });

    const response = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 50.00,
      description: 'Withdraw test'
    }).set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.user_id).toBe(user_id);
    expect(response.body.type).toBe('withdraw');
  });

  it("should not be able to create a deposit with invalid token", async () => {
    const response = await request(app).post('/api/v1/statements/deposit').send({
      amount: 50.00,
      description: 'Deposit test'
    }).set({
      Authorization: `Bearer ${token}invalid token`,
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

  it("should not be able to create a withdraw with invalid token", async () => {
    const response = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 50.00,
      description: 'Withdraw test'
    }).set({
      Authorization: `Bearer ${token}invalid token`,
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

});
