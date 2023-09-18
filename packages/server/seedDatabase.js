import chalk from "chalk";
import keys from "./config/keys";
import Post from "./models/post";
import User from "./models/user";

import exec from "await-exec";

async function seedDatabase() {
  try {
    console.log(chalk.yellow("Checking and populating database..."));

    console.log(chalk.yellow("Creating sample users..."));
    await exec(
      `mongoimport --collection=users --db=snippets --file=./db/users.json ${keys.database.url}`
    );

    console.log(chalk.yellow("Creating sample posts..."));
    await exec(
      `mongoimport --collection=posts --db=snippets --file=./db/posts.json ${keys.database.url}`
    );

    console.log(chalk.green("Successfully populated database!!"));
  } catch (error) {
    console.log(chalk.red(error));
  }
}

module.exports = seedDatabase;
