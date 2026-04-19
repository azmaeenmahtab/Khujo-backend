import fs from 'fs'
// import testgdImage from './pictures/template.png'
import {extractExif, analyzeExifTags} from  './services/exifService'


const imagePath = './src/pictures/p2.jpg'
const buffer = fs.readFileSync(imagePath);

const tags = extractExif(buffer);
const analysis = analyzeExifTags(tags);

console.log('EXIF Tags:', tags);
console.log('Analysis:', analysis);