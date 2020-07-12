import Transaction from '../models/Transaction';
import csvParse, { Parser } from 'csv-parse';
import fs from 'fs';
import CategoriesRepository from '../repositories/CategoriesRepository';
import { getCustomRepository, In } from 'typeorm';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string,
  type: 'income' | 'outcome',
  value: number,
  category: string,
}

class ImportTransactionsService {

  public categoriesRepository = getCustomRepository(CategoriesRepository);
  public transactionsRepository = getCustomRepository(TransactionsRepository);
  categories: Category[] = [];

  transactions: CSVTransaction[] = [];
  categoriesTitle: string[] = [];

  async execute(filePath: string): Promise<Category[]> {

    const parseCSV = this.configCSV(filePath);

    this.readCSVFileAndBuildCategoriesAndTransactions(parseCSV);

    await new Promise(resolve => parseCSV.on('end', resolve));

    const newCategoriesToAdd = await this.filterAndReturnOnlyNewCategoriesToAdd(this.categoriesTitle);

    await this.categoriesRepository.save(newCategoriesToAdd);

    this.categories = [...this.categories, ...newCategoriesToAdd];

    const newTransactions = await this.createTransactions(this.transactions,this.categoriesTitle);

    await this.transactionsRepository.save(newTransactions);

    return newCategoriesToAdd;

  }

  private readCSVFileAndBuildCategoriesAndTransactions(parseCSV: Parser) {

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      this.categoriesTitle.push(category);

      this.transactions.push({ title, type, value, category });

    });

  }

  private configCSV(filePath: string) {
    const contactReadStream = fs.createReadStream(filePath);

    const parses = csvParse({
      from_line: 2,

    });

    return contactReadStream.pipe(parses);
  }

  private async createTransactions(transactions: CSVTransaction[], categories: string[]) {


    return this.transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: this.categories.find(
          category => category.title === transaction.category,
        ),
      }))
    );


  }

  private async filterAndReturnOnlyNewCategoriesToAdd(categories: string[]): Promise<Category[]> {

    this.categories = await this.categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existentsCategoriesTitle = this.categories.map(
      (category: Category) => category.title,
    );

    const titleOfCategoriesToAdd = categories.filter(
      category => !existentsCategoriesTitle.includes(category),
    ).filter((value, index, self) => self.indexOf(value) === index);

    return this.categoriesRepository.create(
      titleOfCategoriesToAdd.map(title => ({
        title,
      })),
    );



  }

}

export default ImportTransactionsService;
