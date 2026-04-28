const xlsx = require('xlsx');

const filePath = String.raw`C:\Users\Visshwajit's PC\Documents\GitHub\Library-App-MechLib\Library_Books_ details.xlsx`;

try {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  const data = xlsx.utils.sheet_to_json(sheet);
  console.log("Total rows:", data.length);
  if (data.length > 0) {
    console.log("Headers:", Object.keys(data[0]));
    console.log("First 3 rows:", JSON.stringify(data.slice(0, 3), null, 2));
  } else {
    console.log("Sheet is empty");
  }
} catch (e) {
  console.error("Error reading file:", e.message);
}
