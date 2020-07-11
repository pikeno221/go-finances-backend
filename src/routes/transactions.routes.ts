import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();



transactionsRouter.get('/', async (request, response) => {

  const transactionRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionRepository.getBalance();


  return response.json(transactions);

});

transactionsRouter.post('/', async (request, response) => {

  try {
    const createTransactionService = new CreateTransactionService();

    const { title, value, type, category } = request.body;

    const transaction = await createTransactionService.execute({ title, value, type, category });

    return response.json(transaction);
  } catch (err) {
    return response.status(400).json({ error: err.message });

  }

});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;
