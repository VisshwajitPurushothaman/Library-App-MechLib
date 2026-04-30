const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'MechLib User Details.xlsx');
const workbook = xlsx.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);

const faculty = data.filter(u => u['Roll number'] && u['Roll number'].toString().startsWith('ME'));
console.log('Sample Faculty:', faculty.slice(0, 5));
