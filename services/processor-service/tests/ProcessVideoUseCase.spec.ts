import { ProcessVideoUseCase } from "../src/useCases/ProcessVideoUseCase";
import { AppDataSource } from "../src/database/data-source";
import * as mailer from "../src/services/mailer";

jest.mock("../src/database/data-source");
jest.mock("../src/services/mailer");

describe("ProcessVideoUseCase", () => {
  let videoRepo: any;
  let userRepo: any;
  let db: Record<string, any>;

  beforeEach(() => {
    jest.clearAllMocks();
    db = {};
    videoRepo = {
      findOne: jest.fn().mockImplementation(({ where }) => Promise.resolve(db[where.id] || null)),
      save: jest.fn().mockImplementation((v) => { db[v.id] = { ...v }; return Promise.resolve(v); }),
    };
    userRepo = { findOne: jest.fn().mockResolvedValue({ id: "u1", email: "user@test.com" }) };
    (AppDataSource.getRepository as jest.Mock) = jest.fn().mockImplementation((entity: any) => {
      return entity.name === "User" ? userRepo : videoRepo;
    });
    (mailer.notifyError as jest.Mock) = jest.fn().mockResolvedValue(undefined);
  });

  const job = { videoId: "v1", userId: "u1", storagePath: "/data/uploads/v.mp4", originalName: "v.mp4" };

  it("deve concluir o processamento com sucesso", async () => {
    db["v1"] = { id: "v1", status: "NA_FILA" };
    const fakeProcessor = { process: jest.fn().mockResolvedValue({ zipPath: "/out/v1.zip", frameCount: 42 }) };
    await new ProcessVideoUseCase(fakeProcessor as any).execute(job);

    expect(db["v1"].status).toBe("CONCLUIDO");
    expect(db["v1"].frameCount).toBe(42);
    expect(db["v1"].zipPath).toBe("/out/v1.zip");
  });

  it("deve marcar ERRO e notificar por email em caso de falha", async () => {
    db["v1"] = { id: "v1", status: "NA_FILA" };
    const fakeProcessor = { process: jest.fn().mockRejectedValue(new Error("vídeo corrompido")) };
    await new ProcessVideoUseCase(fakeProcessor as any).execute(job);

    expect(db["v1"].status).toBe("ERRO");
    expect(db["v1"].errorMessage).toContain("corrompido");
    expect(mailer.notifyError).toHaveBeenCalledWith("user@test.com", "v.mp4", expect.stringContaining("corrompido"));
  });

  it("deve ignorar se o vídeo não existe", async () => {
    const fakeProcessor = { process: jest.fn() };
    await new ProcessVideoUseCase(fakeProcessor as any).execute(job);
    expect(fakeProcessor.process).not.toHaveBeenCalled();
  });

  it("deve passar status para PROCESSANDO antes de concluir", async () => {
    db["v1"] = { id: "v1", status: "NA_FILA" };
    const states: string[] = [];
    const fakeProcessor = { process: jest.fn().mockImplementation(() => {
      states.push(db["v1"].status); // captura o status durante o processamento
      return Promise.resolve({ zipPath: "/z.zip", frameCount: 1 });
    }) };
    await new ProcessVideoUseCase(fakeProcessor as any).execute(job);
    expect(states[0]).toBe("PROCESSANDO");
  });
});
