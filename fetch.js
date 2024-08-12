const notifier = require('node-notifier');
const chalk = require('chalk');
const fetch = require('node-fetch');
const fs = require('fs').promises;

/**
 * @typedef {Object} Config
 * @property {string[]} defaultUrls - Default URLs to search
 * @property {number} defaultPages - Default number of pages to search
 * @property {number} defaultOffsetNeg - Default negative offset for search results
 * @property {number} defaultOffsetPos - Default positive offset for search results
 * @property {number} defaultTimeout - Default timeout for requests
 * @property {number} defaultStartPage - Default starting page number
 */

/** @type {Config} */
const config = {
  defaultUrls: ["https://www.example.com/"],
  defaultPages: 1,
  defaultOffsetNeg: 20,
  defaultOffsetPos: 100,
  defaultTimeout: 1500,
  defaultStartPage: 0
};

/**
 * Parse command line arguments
 * @returns {Object.<string, string|boolean>}
 */
const getArgs = () => {
  return process.argv.slice(2).reduce((acc, arg) => {
    if (arg.startsWith("--")) {
      const [flag, value] = arg.slice(2).split("=");
      acc[flag] = value || true;
    } else if (arg.startsWith("-")) {
      arg.slice(1).split("").forEach(flag => {
        acc[flag] = true;
      });
    }
    return acc;
  }, {});
};

/**
 * Display help information
 */
const displayHelp = () => {
  console.log(chalk.blue("Usage:"));
  console.log(`${chalk.blue("--search=alpha,beta,gamma")} Pass search arguments as csv ${chalk.red("*REQUIRED*")}`);
  console.log(`${chalk.blue("--urls=https://www.example.com,https://www.another.com")} Pass URLs as csv ${chalk.green("*optional*")}`);
  console.log(`${chalk.blue("--pages=5")} Number of pages to search ${chalk.green("*optional*")}`);
  console.log(`${chalk.blue("--offsetneg=20")} Negative offset for search results ${chalk.green("*optional*")}`);
  console.log(`${chalk.blue("--offsetpos=100")} Positive offset for search results ${chalk.green("*optional*")}`);
  console.log(`${chalk.blue("--timeout=1500")} Timeout between requests in ms ${chalk.green("*optional*")}`);
  console.log(`${chalk.blue("--startpage=0")} Starting page number ${chalk.green("*optional*")}`);
};

/**
 * Validate and process command line arguments
 * @param {Object.<string, string|boolean>} args - Parsed command line arguments
 * @returns {Object} Processed arguments
 * @throws {Error} If required arguments are missing
 */
const validateArgs = (args) => {
  if (!args.search) {
    throw new Error("Search argument is required. Use --search=keyword1,keyword2");
  }
  return {
    searchWords: args.search.split(","),
    urls: args.urls ? args.urls.split(",") : config.defaultUrls,
    pages: parseInt(args.pages) || config.defaultPages,
    offsetNeg: parseInt(args.offsetneg) || config.defaultOffsetNeg,
    offsetPos: parseInt(args.offsetpos) || config.defaultOffsetPos,
    timeout: parseInt(args.timeout) || config.defaultTimeout,
    startPage: parseInt(args.startpage) || config.defaultStartPage
  };
};

/**
 * Find the maximum length in an array of strings
 * @param {string[]} arr - Array of strings
 * @returns {number} Maximum length plus padding
 */
const findMax = (arr) => Math.max(...arr.map(el => el.length)) + 7;

/**
 * Pad a string to a specified length
 * @param {string} element - String to pad
 * @param {number} maxLength - Length to pad to
 * @returns {string} Padded string
 */
const fillMissingGap = (element, maxLength) => element.padEnd(maxLength);

/**
 * Fetch with timeout
 * @param {string} url - URL to fetch
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>} Fetch response
 */
const fetchWithTimeout = async (url, timeout) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

/**
 * Check page details for a search key
 * @param {string} pageContent - Page content
 * @param {string} searchKey - Search key
 * @param {string} url - URL of the page
 * @param {number} offsetNeg - Negative offset
 * @param {number} offsetPos - Positive offset
 * @param {Set<string>} uniqueResults - Set of unique results
 * @param {number} maxSearchWordsLength - Maximum length of search words
 * @param {number} maxURLLength - Maximum length of URLs
 */
const checkPageDetails = (pageContent, searchKey, url, offsetNeg, offsetPos, uniqueResults, maxSearchWordsLength, maxURLLength) => {
  const lowercaseContent = pageContent.toLowerCase();
  const lowercaseSearchKey = searchKey.toLowerCase();
  const startIndex = Math.max(0, lowercaseContent.indexOf(lowercaseSearchKey) - offsetNeg);
  const stopIndex = Math.min(pageContent.length, startIndex + searchKey.length + offsetPos);
  const extendedString = pageContent.substring(startIndex, stopIndex);
  
  const setLookup = `${searchKey.padEnd(maxSearchWordsLength)} : ${url.padEnd(maxURLLength)} : ${extendedString.replace(/(\r\n|\n|\r)/gm, "")}`;
  
  if (!uniqueResults.has(setLookup)) {
    console.log("\n" + "-".repeat(80));
    console.log(`${chalk.red(searchKey)} is available on: ${chalk.blue(url)}`);
    console.log(`Found Content: ${extendedString.slice(0, offsetNeg)}${chalk.red(searchKey)}${extendedString.slice(offsetNeg + searchKey.length)}`);
    console.log("-".repeat(80) + "\n");
    uniqueResults.add(setLookup);
  }
};

/**
 * Check availability of search keys on a page
 * @param {string[]} urls - URLs to check
 * @param {number} pageIndex - Page index
 * @param {string[]} searchKeys - Search keys
 * @param {number} offsetNeg - Negative offset
 * @param {number} offsetPos - Positive offset
 * @param {number} timeout - Timeout for requests
 * @param {Set<string>} uniqueResults - Set of unique results
 * @param {number} maxSearchWordsLength - Maximum length of search words
 * @param {number} maxURLLength - Maximum length of URLs
 */
const checkAvailability = async (urls, pageIndex, searchKeys, offsetNeg, offsetPos, timeout, uniqueResults, maxSearchWordsLength, maxURLLength) => {
  for (const url of urls) {
    try {
      const fullUrl = `${url.endsWith('/') ? url : url + '/'}${pageIndex === 0 ? '' : `page/${pageIndex}`}`;
      console.log(`Checking: ${fullUrl} for Keys: ${searchKeys}`);
      
      const response = await fetchWithTimeout(fullUrl, timeout);
      const output = await response.text();
      
      for (const searchKey of searchKeys) {
        if (output.toLowerCase().includes(searchKey.toLowerCase())) {
          checkPageDetails(output, searchKey, fullUrl, offsetNeg, offsetPos, uniqueResults, maxSearchWordsLength, maxURLLength);
        }
      }
    } catch (error) {
      console.error(`Error checking ${url}: ${error.message}`);
    }
    
    // Add a delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};

/**
 * Print search results
 * @param {Set<string>} uniqueResults - Set of unique results
 */
const printSearchResults = (uniqueResults) => {
  console.log("=".repeat(120));
  console.log("-".repeat(50) + "SEARCH-RESULT" + "-".repeat(50));
  console.log("=".repeat(120));
  console.log(chalk.blue("Result Summary:"));
  console.log([...uniqueResults]);
  if (uniqueResults.size !== 0) {
    notifier.notify({
      title: "Attention",
      message: [...uniqueResults].join(",")
    });
  }
};

/**
 * Main execution function
 * @param {Object} args - Processed command line arguments
 * @param {Set<string>} uniqueResults - Set of unique results
 * @param {number} maxSearchWordsLength - Maximum length of search words
 * @param {number} maxURLLength - Maximum length of URLs
 */
const execute = async (args, uniqueResults, maxSearchWordsLength, maxURLLength) => {
  const { searchWords, urls, pages, offsetNeg, offsetPos, timeout, startPage } = args;

  console.log("Search for Keywords:            " + chalk.green(searchWords));
  console.log("Search through URLs:            " + chalk.green(urls));
  console.log("Search pages:                   " + chalk.green(pages));
  console.log("Search with negative offset of: " + chalk.green(offsetNeg));
  console.log("Search with positive offset of: " + chalk.green(offsetPos));
  console.log("Search with timeout of:         " + chalk.green(timeout));
  console.log("Search with startpage of:       " + chalk.green(startPage));

  for (let i = startPage; i <= startPage + pages; i++) {
    await checkAvailability(urls, i, searchWords, offsetNeg, offsetPos, timeout, uniqueResults, maxSearchWordsLength, maxURLLength);
  }
  printSearchResults(uniqueResults);
};

const main = async () => {
  try {
    const args = getArgs();
    
    if (args.help || process.argv.length <= 2) {
      displayHelp();
      process.exit(0);
    }

    const validatedArgs = validateArgs(args);
    const uniqueResults = new Set();
    const maxSearchWordsLength = findMax(validatedArgs.searchWords);
    const maxURLLength = findMax(validatedArgs.urls);

    await execute(validatedArgs, uniqueResults, maxSearchWordsLength, maxURLLength);
  } catch (error) {
    console.error(chalk.red("Error:"), error.message);
    process.exit(1);
  }
};

main();

// Handle SIGINT (Ctrl+C)
process.on("SIGINT", () => {
  console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
  printSearchResults(new Set());
  process.exit();
});
