import request from "supertest";
import express from "express";
import "express-async-errors";

jest.mock("../src/useCases/RegisterUserUseCase", () => ({
  RegisterUserUseCase: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({ id: "u1", name: "Gui", email: "g@g.com" }),
  })),
}));
jest.mock("../src/useCases/LoginUserUseCase", () => ({
  LoginUserUseCase: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({ token: "jwt-token", user: { id: "u1" } }),
  })),
}));

import { AuthController } from "../src/controllers/AuthController";

const app = express();
app.use(express.json());
const c = new AuthController();
app.post("/auth/register", (req, res) => c.register(req, res));
app.post("/auth/login", (req, res) => c.login(req, res));

describe("Rotas de autenticação", () => {
  it("POST /auth/register deve retornar 201", async () => {
    const res = await request(app).post("/auth/register").send({ name: "Gui", email: "g@g.com", password: "123456" });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("POST /auth/login deve retornar token", async () => {
    const res = await request(app).post("/auth/login").send({ email: "g@g.com", password: "123456" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBe("jwt-token");
  });
});
