// Callback Hell Example
// Demonstration of rising complexity and maintainability of code with increased nested callback structure

function callBackHellTrigger() {
  setTimeout(() => {
    console.log("First Return after 3 Seconds");

    setTimeout(() => {
      console.log("Second Return after 3 + 2 Seconds");

      setTimeout(() => {
        console.log("Third Return after 3 + 2 + 1 Seconds ");
      }, 1000);
    }, 2000);
  }, 3000);
}

callBackHellTrigger();

// Promises
// Goal ==> Avoid Callback Hell
// Allows to write async Code in a synchronous fashion
// In javascript a promise is an object that returns a value
