// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';
import Category from '../models/Category';

interface Request {
  title: string,
  value: number,
  type: 'income' | 'outcome',
  category: string,
}

class CreateTransactionService {
  public async execute({ title, value, type, category }: Request): Promise<Transaction> {

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const categoryDB = await this.findOrAdd(category);

    const transaction = transactionsRepository.create({ title, value, type, category: categoryDB})

    console.log('transaction -> ', transaction);

    return transaction;
  }

  private async findOrAdd(categoryName: string): Promise<Category> {

    const categoryRepository = getCustomRepository(CategoriesRepository);

    const findCategory =  await categoryRepository.findOne({
      where: {title: categoryName},
    });

    if (findCategory) return findCategory;

    const newCategory = categoryRepository.create({ title: categoryName});
    const addedCategory = await categoryRepository.save(newCategory);

    return addedCategory;

  }
}

export default CreateTransactionService;
