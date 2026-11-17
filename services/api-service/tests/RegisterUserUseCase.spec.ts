import { RegisterUserUseCase } from "../src/useCases/RegisterUserUseCase";
import { AppDataSource } from "../src/database/data-source";

jest.mock("../src/database/data-source");

describe("RegisterUserUseCase", () => {
  let mockRepo: any;
  beforeEach(() => {
    mockRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((o) => o),
      save: jest.fn().mockImplementation((o) => Promise.resolve({ id: "uuid-1", ...o })),
    };
    (AppDataSource.getRepository as jest.Mock) = jest.fn().mockReturnValue(mockRepo);
  });

  it("deve registrar usuário novo", async () => {
    mockRepo.findOne.mockResolvedValue(null);
    const r = await new RegisterUserUseCase().execute({ name: "Gui", email: "g@g.com", password: "123456" });
    expect(r.email).toBe("g@g.com");
    expect(r).not.toHaveProperty("password");
  });

  it("deve rejeitar email duplicado", async () => {
    mockRepo.findOne.mockResolvedValue({ id: "x" });
    await expect(new RegisterUserUseCase().execute({ name: "Gui", email: "g@g.com", password: "123456" }))
      .rejects.toThrow("já cadastrado");
  });

  it("deve rejeitar senha curta", async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(new RegisterUserUseCase().execute({ name: "Gui", email: "g@g.com", password: "123" }))
      .rejects.toThrow("ao menos 6");
  });
});
