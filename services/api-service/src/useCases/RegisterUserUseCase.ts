import bcrypt from "bcryptjs";
import { AppDataSource } from "../database/data-source";
import { User } from "../entities/User";

export class RegisterUserUseCase {
  async execute(input: { name: string; email: string; password: string }) {
    const repo = AppDataSource.getRepository(User);
    const existing = await repo.findOne({ where: { email: input.email } });
    if (existing) throw new Error("E-mail já cadastrado");
    if (!input.password || input.password.length < 6) {
      throw new Error("Senha deve ter ao menos 6 caracteres");
    }

    const user = repo.create({
      name: input.name,
      email: input.email,
      password: await bcrypt.hash(input.password, 10),
    });
    const saved = await repo.save(user);
    return { id: saved.id, name: saved.name, email: saved.email };
  }
}
