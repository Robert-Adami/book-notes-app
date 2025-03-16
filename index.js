import express from "express";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "capstone",
  password: "Roboadamiponorka1",
  port: "5432",
});
db.connect();

// 📚 Dočasné dáta – knihy

// Middleware – základné nastavenia Expressu
app.use(express.json()); // Parsovanie JSON requestov
app.use(express.urlencoded({ extended: true })); // Podpora URL formulárových dát
app.use(express.static("public")); // Statické súbory (CSS, obrázky atď.)
app.set("view engine", "ejs"); // Použitie EJS ako templating engine

//Async funkcia na ziskavanie dat z databazy
async function getCurrentData() {
  const result = await db.query("SELECT * FROM books");
  let databaseItems = [];
  databaseItems = result.rows;
  return databaseItems;
}
//funkcia na automaticke pridavanie info do url
async function addCoverURLs(books) {
  const booksWithCovers = books.map((book) => ({
    ...book,
    coverURL: `https://covers.openlibrary.org/b/id/${book.internalcoverid}-L.jpg`,
  }));
  return booksWithCovers;
}

// 🌍 Domovská stránka – načítanie kníh a ich obalov
app.get("/", async (req, res) => {
  try {
    const data = await getCurrentData();
    const booksWithCovers = data.map((book) => ({ //toto chcem upraviť aby to bolo efektivenjšie ked mam addCoverURLs funkciu
      ...book,
      coverURL: `https://covers.openlibrary.org/b/id/${book.internalcoverid}-L.jpg`,
    }));

    res.render("index.ejs", { data: booksWithCovers });
  } catch (error) {
    const data = await getCurrentData();
    console.error("❌ Chyba pri načítaní obalov kníh:", error);
    res.render("index.ejs", { data });
  }
});
//zoraďovanie kníh podľa rôznych parametrov 📉
app.get("/order", async (req, res) => {
  try {
    let order = req.query.orderBy;
    let result = null;
    let booksWithCovers = null;
    
    switch (order) {
      case "rating":
        result = await db.query("SELECT * FROM books ORDER BY rating DESC");
        booksWithCovers = await addCoverURLs(result.rows);
        break;
      case "readdate":
        result = await db.query("SELECT * FROM books ORDER BY readdate DESC");
        booksWithCovers = await addCoverURLs(result.rows);
        break;
      case "title":
        result = await db.query("SELECT * FROM books ORDER BY title DESC");
        booksWithCovers = await addCoverURLs(result.rows);
        break;
      default:
        result = await getCurrentData();
        booksWithCovers = await addCoverURLs(result.rows);
        return res.render("index.ejs", { data: booksWithCovers });
        break;
    }

    res.render("index.ejs", { data: booksWithCovers });
  } catch (error) {
    console.error("❌ Chyba pri načítaní obalov kníh:", error);
  }
});

app.post("/add", async (req, res) => {
  try {
    const { title, author, readDate, rating, internalcoverid } = req.body;

    //vložíme do db
    await db.query("INSERT INTO books (title, author, readdate, rating, internalcoverid) VALUES ($1, $2, $3, $4, $5)",
      [title, author, readDate, rating, internalcoverid]
    );

    res.send({ success: true, message: "Kniha úspešne pridaná !" });
  } catch (error) {
    console.error("❌ Chyba pri pridávaní knihy:", error);
    res.status(500).send({ success: false, message: "Chyba servera" });
  }
});
//TU SOM SKONČIL
app.delete("/delete/:id", async (req, res) => {
  try {
    const bookId = req.params.id;

    await db.query("DELETE FROM books WHERE id = $1", [bookId]);
    res.send({ success: true, message: "Kniha úspešne odstránená !" });
  } catch (error) {
    console.error("❌ Chyba pri odstránení knihy:", error);
    res.status(500).send({ success: false, message: "Chyba servera" });
  }
});
// 📡 Spustenie servera
app.listen(port, () => {
  console.log(`✅ Server beží na http://localhost:${port}`);
});
