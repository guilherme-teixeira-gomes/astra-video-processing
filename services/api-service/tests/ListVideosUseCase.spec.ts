import { ListVideosUseCase } from "../src/useCases/ListVideosUseCase";
import { AppDataSource } from "../src/database/data-source";

jest.mock("../src/database/data-source");

describe("ListVideosUseCase", () => {
  it("deve listar vídeos do usuário", async () => {
    const mockRepo = {
      find: jest.fn().mockResolvedValue([
        { id: "v1", originalName: "a.mp4", status: "CONCLUIDO", frameCount: 10, zipPath: "/x.zip", createdAt: new Date(), updatedAt: new Date() },
      ]),
    };
    (AppDataSource.getRepository as jest.Mock) = jest.fn().mockReturnValue(mockRepo);
    const r = await new ListVideosUseCase().execute("u1");
    expect(r.length).toBe(1);
    expect(r[0].hasZip).toBe(true);
  });
});
