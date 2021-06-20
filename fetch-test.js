const fetch = require("node-fetch");
const util = require("util");
const chalk = require("chalk");
const { Console } = require("console");
const { stringify } = require("querystring");

const suffix = "page/";
let pageSet = new Set();

//--------- Args
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

// -------- Params
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

const checkNoOfPages = JSON.stringify(args).includes("pages") ? args.pages : 0;
const startCharOffset = JSON.stringify(args).includes("offsetneg")
  ? args.offsetneg
  : 20;
const endCharOffset = JSON.stringify(args).includes("offsetpos")
  ? args.offsetpos
  : 100;

const timeout = JSON.stringify(args).includes("timeout") ? args.timeout : 1500;
const startpage = JSON.stringify(args).includes("startpage")
  ? args.startpage
  : 0;

async function fetchPage(url) {
  try {
    const res = await fetch(url);
    const data = await res.text();
    const uri = await url;
    return [data, uri];
  } catch (e) {
    console.log(e);
  }
}

function printPages() {
  console.log("RESULTS");
  console.log(pageSet);
}

async function parsePage(page, searchKeys, url) {
  console.log("parsing url: " + url);
  searchKeys.forEach((searchKey) => {
    page = page.toLowerCase();
    if (page.includes(searchKey)) {
      checkPageDetails(page, searchKey, url);
    }
  });
  return "done";
}

function checkPageDetails(pageContent, searchKey, url) {
  //   console.log(
  //     chalk.green("Found Something -- Key: " + searchKey + "  --  URL: " + url)
  //   );
  try {
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
    if (!pageSet.has(setLookup)) {
      console.log("");
      console.log(
        "----------------------------------------------------------------------------------"
      );
      console.log(
        chalk.red(searchKey) + " is available on: " + chalk.blue(url)
      );
      console.log(outputMessage);
      console.log(
        "----------------------------------------------------------------------------------"
      );
      console.log("");
      pageSet.add(setLookup);
    }
    return "done";
  } catch (e) {
    console.log("error occured");
  }
}

function collectPages(urls, searchKeys) {
  urls.forEach((url) => {
    url = url.endsWith("/") ? url : url + "/";
    limit = parseInt(startpage) + parseInt(checkNoOfPages);
    for (let i = parseInt(startpage); i < limit; i++) {
      searchUrl = !(i === 0) ? url + suffix + i : url;
      (async function getWebContent() {
        console.log("Checking: " + searchUrl + " for Keys: " + searchKeys);
        const [page, requrl] = await fetchPage(searchUrl); // still buggy
        // console.log(page);
        // console.log(requrl);
        // TODO ==> Call processing fn
        const done = await parsePage(page, searchKeys, requrl);
        if (i === checkNoOfPages - 1 && done === "done") {
          setTimeout(printPages, 1000);
        }
      })();
    }
  });
}

collectPages(urls, searchWords);
