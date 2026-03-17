import bcrypt from "bcryptjs";
import { usersRepository } from "../repositories/users.repository";
import { CreateUserDTO, UpdateUserDTO } from "../dtos/users.dto";

export const usersService = {
  async getAll() {
    return usersRepository.getAll();
  },

  async getById(id: number) {
    return usersRepository.getById(id);
  },

  async create(data: CreateUserDTO) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const [user] = await usersRepository.create({
      ...data,
      passwordHash,
    });
    return user;
  },

  async update(id: number, data: UpdateUserDTO) {
    const updateData: any = { ...data };
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
      delete updateData.password;
    }

    const [user] = await usersRepository.update(id, updateData);
    return user;
  },

  async delete(id: number) {
    return usersRepository.delete(id);
  },
};
