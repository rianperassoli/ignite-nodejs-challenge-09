import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("Get Balance Controller", () => {
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

  it("should be able to show the balance with 0", async () => {
    const response = await request(app).get('/api/v1/statements/balance').send().set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('balance');
    expect(response.body).toHaveProperty('statement');
    expect(response.body.balance).toBe(0);
    expect(response.body.statement.length).toBe(0);
  });

  it("should be able to show the balance bigger than 0", async () => {

    await request(app).post('/api/v1/statements/deposit').send({
      amount: 150.00,
      description: 'Deposit test 1'
    }).set({
      Authorization: `Bearer ${token}`,
    });

    await request(app).post('/api/v1/statements/deposit').send({
      amount: 75.00,
      description: 'Deposit test 2'
    }).set({
      Authorization: `Bearer ${token}`,
    });

    await request(app).post('/api/v1/statements/withdraw').send({
      amount: 165.00,
      description: 'Withdraw test 1'
    }).set({
      Authorization: `Bearer ${token}`,
    });

    const response = await request(app).get('/api/v1/statements/balance').send().set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('balance');
    expect(response.body).toHaveProperty('statement');
    expect(response.body.balance).toBe(60.00);
    expect(response.body.statement.length).toBe(3);
  });

  it("should not be able to show the balance with invalid token", async () => {
    const response = await request(app).get('/api/v1/statements/balance').send().set({
      Authorization: `Bearer ${token}invalid token`,
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

});
