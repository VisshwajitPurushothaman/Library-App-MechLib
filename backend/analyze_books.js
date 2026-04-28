const xlsx = require('xlsx');

const filePath = String.raw`C:\Users\Visshwajit's PC\Documents\GitHub\Library-App-MechLib\Library_Books_ details.xlsx`;
const workbook = xlsx.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);

const titleGroups = {};

data.forEach(row => {
  const title = (row['Book Name'] || '').toString().trim();
  const author = (row['Author'] || '').toString().trim();
  const barcode = (row['Bar Code Number'] || '').toString().trim();
  
  if (!title) return;
  
  const key = title.toLowerCase() + '|' + author.toLowerCase();
  
  if (!titleGroups[key]) {
    titleGroups[key] = {
      title,
      author,
      count: 0,
      barcodes: []
    };
  }
  
  titleGroups[key].count++;
  if (barcode) titleGroups[key].barcodes.push(barcode);
});

const groupsArray = Object.values(titleGroups).sort((a, b) => b.count - a.count);

console.log("Total unique titles (with author):", groupsArray.length);
console.log("Top 10 most frequent books:");
groupsArray.slice(0, 10).forEach(g => {
  console.log(`- ${g.title} by ${g.author} (${g.count} copies)`);
});
