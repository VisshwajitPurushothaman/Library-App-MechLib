import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from './src/books/entities/book.entity';
import { Issue } from './src/issues/entities/issue.entity';
import { Repository } from 'typeorm';
import * as xlsx from 'xlsx';

async function importBooks() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const booksRepo = app.get<Repository<Book>>(getRepositoryToken(Book));
  const issuesRepo = app.get<Repository<Issue>>(getRepositoryToken(Issue));

  console.log('Deleting all existing issues...');
  await issuesRepo.clear(); // Or delete({})
  
  console.log('Deleting all existing books...');
  await booksRepo.clear();

  const filePath = String.raw`C:\Users\Visshwajit's PC\Documents\GitHub\Library-App-MechLib\Library_Books_ details.xlsx`;
  console.log('Reading Excel file from:', filePath);
  
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet) as any[];

  console.log(`Found ${data.length} rows in Excel. Extracting valid books...`);

  const booksToInsert = [];
  
  // A set to avoid duplicate barcodes in the excel file if any exist
  const seenBarcodes = new Set();

  for (const row of data) {
    const title = (row['Book Name'] || '').toString().trim();
    const barcodeRaw = (row['Bar Code Number'] || '').toString().trim();
    
    if (!title || !barcodeRaw) continue;
    
    // Fallbacks if data is missing
    const author = (row['Author'] || 'Unknown').toString().trim();
    const category = (row['Stream'] || 'Others').toString().trim();
    
    if (seenBarcodes.has(barcodeRaw)) {
      console.warn(`Warning: Duplicate barcode ${barcodeRaw} found in Excel. Skipping.`);
      continue;
    }
    seenBarcodes.add(barcodeRaw);

    const book = booksRepo.create({
      code: barcodeRaw,
      title: title,
      author: author,
      category: category,
      total_copies: 1,
      available_copies: 1,
      description: `Publisher: ${row['Publisher'] || 'N/A'}\nYear: ${row['Publishing Year'] || 'N/A'}\nPrice: ${row['Price'] || 'N/A'}`,
      cover_color: '#0F172A' // Uniform Navy blue color for all books
    });
    
    booksToInsert.push(book);
  }

  console.log(`Parsed ${booksToInsert.length} valid unique books. Inserting in chunks...`);
  
  // Insert in chunks to avoid overwhelming the database limits (SQLite/Postgres)
  const chunkSize = 100;
  for (let i = 0; i < booksToInsert.length; i += chunkSize) {
    const chunk = booksToInsert.slice(i, i + chunkSize);
    await booksRepo.save(chunk);
    console.log(`Inserted chunk ${i / chunkSize + 1} of ${Math.ceil(booksToInsert.length / chunkSize)}`);
  }

  console.log('Import complete! You can now start the server.');
  await app.close();
}

importBooks().catch(err => {
  console.error("Error importing books:", err);
  process.exit(1);
});
