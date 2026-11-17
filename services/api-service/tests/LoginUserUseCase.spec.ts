import { LoginUserUseCase } from "../src/useCases/LoginUserUseCase";
import { AppDataSource } from "../src/database/data-source";
import bcrypt from "bcryptjs";

jest.mock("../src/database/data-source");

describe("LoginUserUseCase", () => {
  let mockRepo: any;
  beforeEach(() => {
    mockRepo = { findOne: jest.fn() };
    (AppDataSource.getRepository as jest.Mock) = jest.fn().mockReturnValue(mockRepo);
  });

  it("deve logar e retornar token", async () => {
    const hash = await bcrypt.hash("123456", 10);
    mockRepo.findOne.mockResolvedValue({ id: "u1", name: "Gui", email: "g@g.com", password: hash });
    const r = await new LoginUserUseCase().execute({ email: "g@g.com", password: "123456" });
    expect(r.token).toBeDefined();
    expect(r.user.email).toBe("g@g.com");
  });

  it("deve rejeitar senha errada", async () => {
    const hash = await bcrypt.hash("123456", 10);
    mockRepo.findOne.mockResolvedValue({ id: "u1", password: hash });
    await expect(new LoginUserUseCase().execute({ email: "g@g.com", password: "errada" }))
      .rejects.toThrow("Credenciais inválidas");
  });

  it("deve rejeitar usuário inexistente", async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(new LoginUserUseCase().execute({ email: "x@x.com", password: "123456" }))
      .rejects.toThrow("Credenciais inválidas");
  });
});
