const express = require("express");
const ejs = require("ejs");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const MongoDBURI = process.env.MONGO_URI || "mongodb://localhost/ManualAuth";

mongoose.connect(MongoDBURI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Erro de conexão:"));
db.once("open", () => {});

app.use(
  session({
    secret: "work hard",
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: db
    })
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + "/views"));

const index = require("./routes/index");
app.use("/", index);

// pegar 404 e encaminhar para o manipulador de erros
app.use((req, res, next) => {
  const err = new Error("Arquivo não encontrado");
  err.status = 404;
  next(err);
});

// manipulador de erros
// definir como o último retorno app.use callback
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err.message);
});

// listar na porta 8080
app.listen(process.env.PORT || 3000, () => {
  console.log("Express app na porta 3000");
});
