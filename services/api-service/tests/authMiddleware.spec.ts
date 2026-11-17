import { authMiddleware } from "../src/middlewares/authMiddleware";
import jwt from "jsonwebtoken";

describe("authMiddleware", () => {
  const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it("deve bloquear sem token", () => {
    const req: any = { headers: {} };
    const res = mockRes();
    authMiddleware(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("deve bloquear token inválido", () => {
    const req: any = { headers: { authorization: "Bearer xpto" } };
    const res = mockRes();
    authMiddleware(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("deve liberar com token válido e popular userId", () => {
    const token = jwt.sign({ sub: "u1", email: "g@g.com", name: "Gui" }, "fiapx-secret");
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.userId).toBe("u1");
  });
});
