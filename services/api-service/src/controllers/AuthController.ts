import { Request, Response } from "express";
import { RegisterUserUseCase } from "../useCases/RegisterUserUseCase";
import { LoginUserUseCase } from "../useCases/LoginUserUseCase";

export class AuthController {
  async register(req: Request, res: Response) {
    const user = await new RegisterUserUseCase().execute(req.body);
    return res.status(201).json({ success: true, data: user });
  }

  async login(req: Request, res: Response) {
    const result = await new LoginUserUseCase().execute(req.body);
    return res.json({ success: true, ...result });
  }
}
