const fs = require("fs");
const http = require("http");
const url = require("url");
const replaceTemplate = require("./modules/replaceTemplate");

///////////////////////////////////////
// FILES
///////////////////////////////////////

// Blocking, synchronouse way
// const { text } = require("stream/consumers");

// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// console.log(textIn);

// const textOut = `This is what we know about the avocado: ${textIn}. \nCreated on ${Date.now()}`;
// fs.writeFileSync("./txt/output.txt", textOut);
// console.log("File written");

// Non-blocking, asynchronous way  CALLBACK HELL
// fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
//   if (err) return console.log("ERROR!");
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
//     console.log(data2);
//     fs.readFile("./txt/append.txt", "utf-8", (err, data3) => {
//       console.log(data3);

//       fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
//         // there is no data
//         console.log("Files have been written!!!");
//       });
//     });
//   });
// });

// console.log("Will read file!"); // we see this first, js reads previous file in background

///////////////////////////////////////
// SERVER
///////////////////////////////////////

//template variables
//only executed once when program starts => SYNCHRONOUS => NOT POSSIBLE IN SERVER CALLBACK FUNCTION
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data); // array of all objects in data.json

// executed after every request
const server = http.createServer((req, res) => {
  // routing
  const { query, pathname } = url.parse(req.url, true); //destructurizing so we can easily get the query id

  //overview page
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-type": "text/html" });
    // we convert the array of objects in dataObj => each object becomes card an then joined to string
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join(" ");
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
    res.end(output);

    //product page
  } else if (pathname === "/product") {
    res.writeHead(200, { "Content-type": "text/html" });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);
    //API
  } else if (pathname === "/api") {
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(data);

    // not found
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "Hello world",
    });
    res.end("<h1>PAGE NOT FOUND!</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening for requests on port 8000");
});
