import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../database/data-source";
import { User } from "../entities/User";

export class LoginUserUseCase {
  async execute(input: { email: string; password: string }) {
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { email: input.email } });
    if (!user) throw new Error("Credenciais inválidas");

    const ok = await bcrypt.compare(input.password, user.password);
    if (!ok) throw new Error("Credenciais inválidas");

    const secret = process.env.JWT_SECRET || "fiapx-secret";
    const token = jwt.sign({ sub: user.id, email: user.email, name: user.name }, secret, { expiresIn: "8h" });
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  }
}
