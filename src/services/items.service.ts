import { itemsRepository } from "../repositories/items.repositories";
import type { CreateItemDto, UpdateItemDto } from "../dtos/items.dto";

export const itemsService = {

  async getAll() {
    return itemsRepository.getAll();
  },

  async getById(id: number) {
    return itemsRepository.getById(id);
  },

  async create(data: CreateItemDto & { userId?: number }) {
    const [item] = await itemsRepository.create(data);
    return item;
  },

  async update(id: number, data: UpdateItemDto) {
    const [updated] = await itemsRepository.update(id, data);
    return updated;
  },

  async delete(id: number) {
    return itemsRepository.delete(id);
  }

};