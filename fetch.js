const chalk = require("chalk");
const { Console } = require("console");
const fetch = require("node-fetch");

function getArgs() {
  const args = {};
  process.argv.slice(2, process.argv.length).forEach((arg) => {
    // long arg
    if (arg.slice(0, 2) === "--") {
      const longArg = arg.split("=");
      const longArgFlag = longArg[0].slice(2, longArg[0].length);
      const longArgValue = longArg.length > 1 ? longArg[1] : true;
      args[longArgFlag] = longArgValue;
    }
    // flags
    else if (arg[0] === "-") {
      const flags = arg.slice(1, arg.length).split("");
      flags.forEach((flag) => {
        args[flag] = true;
      });
    }
  });
  return args;
}

const args = getArgs(process.argv);

if (JSON.stringify(args).includes("help") || process.argv.length <= 2) {
  console.log(
    chalk.blue("--search=alpha,beta,gamma") +
      "                            Pass search arguments as csv " +
      chalk.red("*REQUIRED*")
  );
  console.log(
    chalk.blue("--urls=https://www.google.com,https://www.online.com") +
      " Pass search arguments as csv " +
      chalk.green("*optional*") +
      " default one address"
  );
  console.log(
    chalk.blue("--pages=5                ") +
      "                            Pass search arguments as single value " +
      chalk.green("*optional*") +
      " default value is 1"
  );
  console.log(
    chalk.blue("--offsetneg=20           ") +
      "                            Pass search arguments as single value " +
      chalk.green("*optional*") +
      " default value is 20"
  );
  console.log(
    chalk.blue("--offsetpos=100          ") +
      "                            Pass search arguments as single value " +
      chalk.green("*optional*") +
      " default value is 100"
  );
  console.log(
    chalk.blue("--timeout=1500           ") +
      "                            Pass search arguments as single value " +
      chalk.green("*optional*") +
      " default value is 1500"
  );
  console.log(
    chalk.blue("--startpage=0           ") +
      "                             Pass search arguments as single value " +
      chalk.green("*optional*") +
      " default value is 0"
  );
  process.exit(1);
}

// Pass search arguments as csv: => --search=alpha,beta,gamma
// Pass no of pages to search as argument: => --pages=5 ==> No params takes 1 as default
// Pass start offset to search as argument: => --offsetneg=5 ==> No params takes 20 as default
// Pass end offset to search as argument: => --offsetneg=100 ==> No params takes 100 as default
let searchWords;

if (JSON.stringify(args).includes("search")) {
  if (args.search.includes(",")) {
    searchWords = args.search.split(",");
  } else {
    searchWords = [args.search];
  }
}

if (searchWords[0].length <= 1) {
  console.log(chalk.red("Execution Stopped"));
  console.log(
    "Provide " + chalk.blue("--search=alpha,beta,gamma") + " argument"
  );
  process.exit(1);
}

let urls = ["https://www.google.com/"];
if (JSON.stringify(args).includes("urls")) {
  if (args.urls.includes(",")) {
    urls = args.urls.split(",");
  } else {
    urls = [args.urls];
  }
}

var uniqueResults = new Set();
const checkNoOfPages = JSON.stringify(args).includes("pages") ? args.pages : 0;
const startCharOffset = JSON.stringify(args).includes("offsetneg")
  ? args.offsetneg
  : 20;
const endCharOffset = JSON.stringify(args).includes("offsetpos")
  ? args.offsetpos
  : 100;

const timeout = JSON.stringify(args).includes("timeout") ? args.timeout : 1500;
let startpage = JSON.stringify(args).includes("startpage") ? args.startpage : 0;

(function startScriptSummary() {
  console.log("Search for Keywords:            " + chalk.green(searchWords));
  console.log("Search through URLs:            " + chalk.green(urls));
  console.log("Search pages:                   " + chalk.green(checkNoOfPages));
  console.log(
    "Search with negative offset of: " + chalk.green(startCharOffset)
  );
  console.log("Search with positive offset of: " + chalk.green(endCharOffset));
  console.log("Search with timeout of:         " + chalk.green(timeout));
  console.log("Search with startpage of:       " + chalk.green(startpage));
})();

let maxSearchWordsLength = 0;
let indexSearchWordsLength = 0;
let maxURLLength = 0;
let indexURLLength = 0;

[maxURLLength, indexURLLength] = findMax(urls);
[maxSearchWordsLength, indexSearchWordsLength] = findMax(searchWords);

function findMax(arr) {
  maxLength = 0;
  maxLengthIndex = 0;
  arr.forEach((element, i) => {
    if (element.length > maxLength) {
      maxLength = element.length;
      maxLengthIndex = i;
    }
  });
  return [maxLength + 7, maxLengthIndex];
}

function fillMissingGap(element, maxLength) {
  delta = maxLength - element.length;
  for (let i = 0; i < delta; i++) {
    element += " ";
  }
  return element;
}

function processGap(arr) {
  // provides an adjusted array
  const results = findMax(arr);
  return arr.map((elem) => fillMissingGap(elem, results[0]));
}

// function checkAvailability(url, searchKey) {
//   return fetch(url)
//     .then((response) => response.text())
//     .then((output) =>
//       output.toLowerCase().includes(searchKey)
//         ? checkPageDetails(output, searchKey, url)
//         : ""
//     );
// }

// function checkAvailability(url, searchKeys) {
//   return fetch(url)
//     .then((response) => response.text())
//     .then((output) =>
//       searchKeys.forEach((searchKey) =>
//         output.toLowerCase().includes(searchKey)
//           ? checkPageDetails(output, searchKey, url)
//           : ""
//       )
//     );
// }

function checkAvailability(urls, pageIndex, searchKeys) {
  return urls.forEach((url) => {
    {
      url = url.endsWith("/") ? url : url + "/";
      url = pageIndex == 0 ? url : url.concat("page/").concat(pageIndex);
      console.log("Checking: " + url + " for Keys: " + searchKeys);
    }
    fetch(url)
      .then((response) => response.text())
      .then((output) =>
        searchKeys.forEach((searchKey) =>
          output.toLowerCase().includes(searchKey)
            ? checkPageDetails(output, searchKey, url)
            : ""
        )
      );
  });
}

function printSearchResults() {
  console.log(
    "================================================================================================================================================================"
  );
  console.log(
    "------------------------------------------------------------------------SEARCH-RESULT---------------------------------------------------------------------------"
  );
  console.log(
    "================================================================================================================================================================"
  );
  console.log(chalk.blue("Result Summary:"));

  console.log(uniqueResults);
}

async function checkPageDetails(pageContent, searchKey, url) {
  console.log(
    chalk.green("Found Something -- Key: " + searchKey + "  --  URL: " + url)
  );
  finalString = "";
  startIndex = pageContent.indexOf(searchKey) - startCharOffset;
  stopIndex = startIndex + searchKey.length + endCharOffset;
  extendedString = pageContent.substring(startIndex, stopIndex);
  keyPrefix = extendedString.substring(0, startCharOffset);
  keySuffix = extendedString.substring(
    startCharOffset + searchKey.length,
    endCharOffset
  );
  outputMessage =
    "Found Content: " + keyPrefix + chalk.red(searchKey) + keySuffix;
  finalString += outputMessage;
  setLookup =
    fillMissingGap(searchKey, maxSearchWordsLength) +
    " : " +
    fillMissingGap(url, maxURLLength) +
    " : " +
    extendedString.replace(/(\r\n|\n|\r)/gm, "");
  if (!uniqueResults.has(setLookup)) {
    console.log("");
    console.log(
      "----------------------------------------------------------------------------------"
    );
    console.log(chalk.red(searchKey) + " is available on: " + chalk.blue(url));
    console.log(outputMessage);
    console.log(
      "----------------------------------------------------------------------------------"
    );
    console.log("");
    uniqueResults.add(setLookup);
  }
}

function delay() {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

async function delayedLog(item) {
  // notice that we can await a function
  // that returns a promise
  await delay();
  //   console.log("Check Next URL");
}

async function execute() {
  for (
    i = parseInt(startpage);
    i <= parseInt(startpage) + parseInt(checkNoOfPages);
    i++
  ) {
    //   pagenav = urls;
    //   pagenav = i == 0 ? pagenav : pagenav.concat("page/").concat(i);
    //   console.log(pagenav);
    await delayedLog(checkAvailability(urls, i, searchWords));
  }
  printSearchResults();
}

// for (let i = 0; i <= checkNoOfPages; i++) {
//   //   pagenav = urls;
//   //   pagenav = i == 0 ? pagenav : pagenav.concat("page/").concat(i);
//   //   console.log(pagenav);
//   checkAvailability(urls, i, searchWords);
//   console.log(uniqueResults);
// }

execute();

process.on("SIGINT", function () {
  console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
  printSearchResults();
  process.exit();
});
