// import AppError from '../errors/AppError';

import { getCustomRepository, TransactionRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string,
  value: number,
  type: 'income' | 'outcome',
  category: string,
}

interface Response {
  id: string,
  title: string,
  value: number,
  type: 'income' | 'outcome',
  category: string,

}

class CreateTransactionService {

  public async execute({ title, value, type, category }: Request): Promise<Response> {

    if (!['income', 'outcome'].includes(type)) {
      throw new Error('Transaction type ins not valid');

    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const totalBalance = await transactionsRepository.getBalance();


    if (type == 'outcome' && value > totalBalance.balance.total) throw new AppError('The value that you are trying to get is biggest than your balance. ', 400);


    const categoryDB = await this.findOrAdd(category);

    const transaction = transactionsRepository.create({ title, value, type, category: categoryDB })

    await transactionsRepository.save(transaction);

    return { id: transaction.id, title: transaction.title, value: transaction.value, type: transaction.type, category: transaction.category.title };

  }

  private async findOrAdd(categoryName: string): Promise<Category> {

    const categoryRepository = getCustomRepository(CategoriesRepository);

    const findCategory = await categoryRepository.findOne({
      where: { title: categoryName },
    });

    if (findCategory) return findCategory;

    const newCategory = categoryRepository.create({ title: categoryName });
    const addedCategory = await categoryRepository.save(newCategory);

    return addedCategory;

  }
}

export default CreateTransactionService;
