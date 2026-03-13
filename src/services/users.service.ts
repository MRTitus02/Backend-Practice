import { usersRepository } from "../repositories/users.repository";

export const usersService = {
  async getAll() {
    return usersRepository.getAll();
  },

  async getById(id: number) {
    const [user] = await usersRepository.getById(id);
    return user;
  },

  async create(data: { name: string; email: string }) {
    const [user] = await usersRepository.create(data);
    return user;
  },

  async update(id: number, data: any) {
    const [user] = await usersRepository.update(id, data);
    return user;
  },

  async delete(id: number) {
    return usersRepository.delete(id);
  },
};
