import { usersRepository } from "../repositories/users.repository";
import { CreateUserDTO, UpdateUserDTO } from "../dtos/users.dto";

export const usersService = {
  async getAll() {
    return usersRepository.getAll();
  },

  async getById(id: number) {
    const [user] = await usersRepository.getById(id);
    return user;
  },

  async create(data: CreateUserDTO) {
    const [user] = await usersRepository.create(data);
    return user;
  },

  async update(id: number, data: UpdateUserDTO) {
    const [user] = await usersRepository.update(id, data);
    return user;
  },

  async delete(id: number) {
    return usersRepository.delete(id);
  },
};
