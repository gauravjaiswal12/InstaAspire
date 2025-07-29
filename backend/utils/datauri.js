const DataUriParser = require('datauri/parser');
const path = require('path');

const parser = new DataUriParser();

const getDataUri = (file) => {
    const extName = path.extname(file.name).toString(); // use .name instead of .originalname
    return parser.format(extName, file.data).content;   // use .data instead of .buffer
};

module.exports = getDataUri;