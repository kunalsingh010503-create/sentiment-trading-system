const yahoo = require('yahoo-finance2');

console.log("--- DEBUG START ---");
console.log("Type of export:", typeof yahoo);
console.log("Keys:", Object.keys(yahoo));
console.log("Is 'default' inside?", !!yahoo.default);
if (yahoo.default) {
    console.log("Keys inside 'default':", Object.keys(yahoo.default));
}
console.log("--- DEBUG END ---");