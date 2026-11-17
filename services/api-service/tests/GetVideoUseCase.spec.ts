import { GetVideoUseCase } from "../src/useCases/GetVideoUseCase";
import { AppDataSource } from "../src/database/data-source";

jest.mock("../src/database/data-source");

describe("GetVideoUseCase", () => {
  let mockRepo: any;
  beforeEach(() => {
    mockRepo = { findOne: jest.fn() };
    (AppDataSource.getRepository as jest.Mock) = jest.fn().mockReturnValue(mockRepo);
  });

  it("deve retornar vídeo do próprio usuário", async () => {
    mockRepo.findOne.mockResolvedValue({ id: "v1", userId: "u1" });
    const r = await new GetVideoUseCase().execute("v1", "u1");
    expect(r.id).toBe("v1");
  });

  it("deve negar acesso a vídeo de outro usuário", async () => {
    mockRepo.findOne.mockResolvedValue({ id: "v1", userId: "outro" });
    await expect(new GetVideoUseCase().execute("v1", "u1")).rejects.toThrow("Acesso negado");
  });

  it("deve falhar se vídeo não existe", async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(new GetVideoUseCase().execute("v1", "u1")).rejects.toThrow("não encontrado");
  });
});
