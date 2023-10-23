module.exports = {
  HOST: "postcrawler.zzz.com.ua",
  USER: "postcrawler",
  PASSWORD: "PostcrawlerUkraineDB2023",
  DB: "postcrawler",
  port: 3306,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
