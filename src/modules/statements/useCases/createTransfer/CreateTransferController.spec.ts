import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("Create Transfer Controller", () => {
  let token = '';
  let sender_id = '';
  const sender_name = "Sender Test";
  const sender_email = "sender@email.com";
  const sender_password = "12345";
  let user_id = '';
  const user_name = "User Test";
  const user_email = "test@email.com";
  const user_password = "12345";

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users/').send({
      name: sender_name,
      email: sender_email,
      password: sender_password
    });

    await request(app).post('/api/v1/users/').send({
      name: user_name,
      email: user_email,
      password: user_password
    });

    let authResponse = await request(app).post('/api/v1/sessions/').send({
      email: user_email,
      password: user_password
    });
    user_id = authResponse.body.user.id;

    authResponse = await request(app).post('/api/v1/sessions/').send({
      email: sender_email,
      password: sender_password
    });

    token = authResponse.body.token;
    sender_id = authResponse.body.user.id;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should not be able to create a transfer with no balance", async () => {
    const response = await request(app).post(`/api/v1/statements/transfers/${user_id}`).send({
      amount: 900.00,
      description: 'Transfer test'
    }).set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  it("should be able to create a transfer", async () => {
    await request(app).post('/api/v1/statements/deposit').send({
      amount: 150.00,
      description: 'Deposit test'
    }).set({
      Authorization: `Bearer ${token}`,
    });

    const response = await request(app).post(`/api/v1/statements/transfers/${user_id}`).send({
      amount: 150.00,
      description: 'Transfer test'
    }).set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.user_id).toBe(user_id);
    expect(response.body.sender_id).toBe(sender_id);
    expect(response.body.type).toBe('transfer');
  })

});
