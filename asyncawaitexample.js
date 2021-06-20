// async / await
// async must be present, always returns a promise
// await waits till promise is settled via resolve or reject
// error handling - try/catch block

const users = [
  { id: 1, name: "john" },
  { id: 2, name: "susan" },
  { id: 3, name: "anna" },
];

const articles = [
  { userId: 1, articles: ["one", "two", "three"] },
  { userId: 2, articles: ["four", "five"] },
  { userId: 3, articles: ["six", "seven", "eight", "nine"] },
];

function getUser(name) {
  return new Promise((resolve, reject) => {
    const user = users.find((user) => user.name === name);
    if (user) {
      return resolve(user);
    } else {
      reject(`No such user with name: ${name}`);
    }
  });
}

function getArticles(userId) {
  return new Promise((resolve, reject) => {
    const userArticles = articles.find((user) => user.userId === userId);

    if (userArticles) {
      return resolve(userArticles.articles);
    } else {
      reject("Wrong Id");
    }
  });
}

getUser("susan")
  .then((user) => console.log(user))
  .catch((err) => console.log(err));

// failing example
getUser("johan")
  .then((user) => console.log(user))
  .catch((err) => console.log(err));

// go down to articles with promises
getUser("susan")
  .then((user) => getArticles(user.id)) // gets back the object beloning to the user, here we can access the users id and pass it to get articles
  .then((articles) => console.log(articles)) // if the id matches to one element of the articles json, it return the according entry
  .catch((err) => console.log(err));

const getDataAlternative = async (name) => {
  const user = await getUser(name);
  console.log(user + " async user");
  if (user) {
    const articles = await getArticles(user.id);
    console.log(articles + " async articles");
  }
};

getDataAlternative("john");

const getDataAnotherAlternative = async (name) => {
  try {
    const user = await getUser(name);
    if (user) {
      const articles = await getArticles(user.id);
      console.log(articles + " Another alternative");
    }
  } catch (error) {
    console.log(error);
  }
};

getDataAnotherAlternative("john");

const getDataAnotherAlternativeConsize = async (name) => {
  try {
    const user = await getUser(name);
    const articles = await getArticles(user.id);
    console.log(articles + " Another alternative");
  } catch (error) {
    console.log(error + " this is wrong!");
  }
};

getDataAnotherAlternativeConsize("johns");
