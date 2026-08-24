const net = require("net");
net.setDefaultAutoSelectFamilyAttemptTimeout(10000);

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  return console.error("Something went wrong with the db connection", err);
});

module.exports = pool;
