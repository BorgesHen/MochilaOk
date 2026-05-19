require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const categoriesRouter = require("./routes/categories");
const destinationsRouter = require("./routes/destinations");
const itemsRouter = require("./routes/items");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:4200",
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("API MochilaOk rodando. Teste /health");
});

app.get("/health", (req, res) => res.send("OK"));

app.use("/auth", authRoutes);
app.use("/destinations", destinationsRouter);
app.use("/destinations", categoriesRouter);
app.use("/destinations", itemsRouter);
app.use(itemsRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Erro interno" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
