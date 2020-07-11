import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionListResponse {
  transactions: Transaction[],
  balance: Balance
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<TransactionListResponse> {

    const transactions = await this.find({ relations: ['category']});

    const balance = transactions.reduce((accumulator, transaction) => {

      if (transaction.type == 'income') {
        accumulator.income += transaction.value;
      } else {
        accumulator.outcome += transaction.value;
      }
      return accumulator;

    }, {
        income: 0,
        outcome: 0,
      });

    const total = balance.income - balance.outcome;

    const balanceTransac = { income: balance.income, outcome: balance.outcome, total: total };
    return { transactions, balance: balanceTransac };
  }
}

export default TransactionsRepository;
