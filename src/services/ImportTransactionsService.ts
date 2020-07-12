import Transaction from '../models/Transaction';
import csvParse from 'csv-parse';
import fs from 'fs';
import CategoriesRepository from '../repositories/CategoriesRepository';
import { getCustomRepository, In } from 'typeorm';
import Category from '../models/Category';

interface CSVTransaction {
  title: string,
  type: 'income' | 'outcome',
  value: number,
  category: string,
}

class ImportTransactionsService {

  public categoriesRepository = getCustomRepository(CategoriesRepository);

  async execute(filePath: string): Promise<string[]> {
    const contactReadStream = fs.createReadStream(filePath);


    const parses = csvParse({
      from_line: 2,

    });

    const parseCSV = contactReadStream.pipe(parses);


    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);

      transactions.push({ title, type, value, category });

    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const newCategoriesToAdd = await this.filterAndReturnOnlyNewCategoriesToAdd(categories);

    await this.categoriesRepository.save(newCategoriesToAdd);

    return newCategoriesToAdd;

  }

  private async filterAndReturnOnlyNewCategoriesToAdd(categories: string[]): Promise<Category[]> {

    const existentCategories = await this.categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existentsCategoriesTitle =  existentCategories.map(
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
