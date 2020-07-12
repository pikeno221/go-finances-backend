import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);

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
  try {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    await transactionRepository.delete(request.params.id);

    return response.status(204).json(null);

  } catch (err) {
    return  response.json({ error: err.message });

  }
});

transactionsRouter.post('/import',
upload.single('file'),
async (request, response) => {
  const importTransactions = new ImportTransactionsService();

  const transactions = await importTransactions.execute(request.file.path);

  return response.json(transactions);
});

export default transactionsRouter;
