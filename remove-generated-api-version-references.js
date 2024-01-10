const fs = require('fs');
const filePath = process.argv[2];

console.log(`Removing API version references from types and interfaces in '${filePath}'.`);
if (filePath) {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error(`Error reading file in '${filePath}'.`);
      throw err;
    }

    let updatedData = data.replace(/export type V\d+/g, 'export type ');
    updatedData = updatedData.replace(/export interface V\d+/g, 'export interface ');

    fs.writeFile(filePath, updatedData, 'utf-8', (err) => {
      if (err) {
        console.error(`Error writing file in '${filePath}'.`);
        throw err;
      }
    });
  });
}
