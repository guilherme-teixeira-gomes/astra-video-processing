import { UploadVideoUseCase } from "../src/useCases/UploadVideoUseCase";
import { AppDataSource } from "../src/database/data-source";
import * as rabbit from "../src/messaging/rabbitmq";
import * as redisSvc from "../src/services/redis";

jest.mock("../src/database/data-source");
jest.mock("../src/messaging/rabbitmq");
jest.mock("../src/services/redis");

describe("UploadVideoUseCase", () => {
  let mockRepo: any;
  beforeEach(() => {
    jest.clearAllMocks();
    mockRepo = {
      create: jest.fn().mockImplementation((o) => o),
      save: jest.fn().mockImplementation((o) => Promise.resolve({ id: "vid-1", ...o })),
    };
    (AppDataSource.getRepository as jest.Mock) = jest.fn().mockReturnValue(mockRepo);
    (rabbit.publishVideoJob as jest.Mock) = jest.fn().mockResolvedValue(undefined);
    (redisSvc.cacheStatus as jest.Mock) = jest.fn().mockResolvedValue(undefined);
  });

  it("deve criar vídeo com status NA_FILA e publicar na fila", async () => {
    const r = await new UploadVideoUseCase().execute({
      userId: "u1", originalName: "video.mp4", storagePath: "/data/uploads/video.mp4",
    });
    expect(r.status).toBe("NA_FILA");
    expect(rabbit.publishVideoJob).toHaveBeenCalledWith(expect.objectContaining({ videoId: "vid-1", userId: "u1" }));
  });

  it("deve cachear o status no Redis", async () => {
    await new UploadVideoUseCase().execute({ userId: "u1", originalName: "v.mp4", storagePath: "/p" });
    expect(redisSvc.cacheStatus).toHaveBeenCalledWith("vid-1", "NA_FILA");
  });
});
