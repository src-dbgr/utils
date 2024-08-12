# Web Search Script

## Overview

This script is a powerful, flexible command-line tool designed to search for specific keywords across multiple web pages. Built with Node.js and leveraging modern JavaScript (ESM), this tool is optimized for performance, scalability, and ease of use. It supports concurrent web requests, customizable search parameters, and provides clear, real-time feedback to the user.

This project is ideal for anyone looking to efficiently search for content across various websites, whether for data gathering, content verification, or competitive analysis.

## Features

- **Concurrent Web Scraping:** Efficiently handles multiple URLs with configurable concurrency limits.
- **Customizable Search Parameters:** Specify keywords, number of pages to search, and content offsets to fine-tune your results.
- **Real-time Notifications:** Instant notifications via desktop alerts when keywords are found.
- **Modern JavaScript (ESM):** Utilizes ES modules and modern async/await syntax for better performance and readability.

## Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (Node Package Manager)

You can verify your Node.js and npm installation by running:

```bash
node -v
npm -v
```

### Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/src-dbgr/utils.git
   cd utils
   ```

2. **Install dependencies:**

   Run the following command in your project directory to install the required npm packages:

   ```bash
   npm install
   ```

   This will install the necessary packages including `chalk`, `node-notifier`, and `node-fetch`.

## Usage

The script can be run from the command line and accepts several parameters to customize the search behavior.

### Basic Command

```bash
node fetch.mjs --search=keyword1,keyword2 --urls=https://example.com,https://another.com
```

### Available Parameters

- **`--search`** (required): Comma-separated list of keywords to search for on the specified websites.
- **`--urls`** (optional): Comma-separated list of URLs to search. Defaults to `https://www.example.com/` if not provided.
- **`--pages`** (optional): Number of pages to search per URL. Default is 1.
- **`--offsetneg`** (optional): Number of characters before the keyword in the search results. Default is 20.
- **`--offsetpos`** (optional): Number of characters after the keyword in the search results. Default is 100.
- **`--timeout`** (optional): Timeout for each request in milliseconds. Default is 1500ms.
- **`--startpage`** (optional): Page number to start the search from. Default is 0.

### Example Usage

To search for "Node.js" and "JavaScript" across the first 3 pages of the specified websites:

```bash
node fetch.mjs --search=Node.js,JavaScript --urls=https://www.example.com,https://www.some-random-page.org
```

This command will:

- Search for "Node.js" and "JavaScript" of `https://www.example.com` and `https://www.some-random-page.org`.
- Display results in the console with the context around the found keywords.
- Trigger a desktop notification if any of the keywords are found.

### Help

You can display help information by running:

```bash
node fetch.mjs --help
```

This will print out all available options and their usage.

## Error Handling

The script includes robust error handling to manage network issues and invalid inputs. If an error occurs, it will be logged in the console with a descriptive message to assist in debugging.

## Contribution

Contributions to enhance the functionality of this script are welcome. Feel free to fork the repository and submit a pull request with your improvements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions or need further assistance, feel free to reach out via [src.dbgr@gmail.com](mailto:src.dbgr@gmail.com) or through GitHub issues.

---

**Note:** This script was developed as part of a personal project since I had the need to search for certain keywords on multiple webpages. It demonstrates modern JavaScript practices.