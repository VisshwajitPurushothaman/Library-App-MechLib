const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'MechLib User Details.xlsx');
const workbook = xlsx.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);

const passwords = new Set();
data.forEach(row => {
  passwords.add(row.Password);
});

console.log('Unique passwords in Excel:', Array.from(passwords));
