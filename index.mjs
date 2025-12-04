// initialize express app
import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection
const pool = mysql.createPool({
    host: "y5s2h87f6ur56vae.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "x961annv2rwlrope",
    password: "yziygibqpk3q352o",
    database: "c5dhod81zi9fvecy",
    connectionLimit: 10,
    waitForConnections: true
});

//routes
app.get('/', (req, res) => {
   res.render('index')
});

app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error");
    }
});//dbTest

// post route to handle form submission
app.post("/author/new", async function(req, res){
    let fName= req.body.fName;
    let lName = req.body.lName;
    let birthDate = req.body.birthDate;
    // allow to be empty if still alive
    let deathDate = req.body.deathDate || null;
    let sex = req.body.sex;
    let profession = req.body.profession;
    let country = req.body.country;
    let portrait = req.body.portrait;
    let biography = req.body.biography;

    let sql = `
        INSERT INTO q_authors
        (firstName, lastName, dob, dod, sex, profession, country, portrait, biography)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    let params = [fName, lName, birthDate, deathDate, sex, profession, country, portrait, biography];
    const [rows] = await pool.query(sql, params);
    res.render("newAuthor", {"message": "Author added!"});
});

// new route to render list of authors
app.get("/authors", async function (req, res) {
    let sql = `
        SELECT *
        FROM q_authors
        ORDER BY lastName`;
    const [rows] = await pool.query(sql);
    res.render("authorList", {"authors":rows});
});

// new route to allow editing to authors
app.get("/author/edit", async function(req, res) {
    let authorId = req.query.authorId;

    let sql = `
        SELECT *,
        DATE_FORMAT(dob, '%Y-%m-%d') dobISO,
        DATE_FORMAT(dod, '%Y-%m-%d') dodISO
        FROM q_authors
        WHERE authorId = ?`;
    const [rows] = await pool.query(sql, [authorId]);
    res.render("editAuthor", {"authorInfo":rows});
});

// new route to publish these edits
app.post("/author/edit", async function(req, res) {
    let sql = `
        UPDATE q_authors
        SET firstName = ?,
            lastName = ?,
            dob = ?,
            dod = ?,
            sex = ?,
            profession = ?,
            country = ?,
            portrait = ?,
            biography = ?
        WHERE authorId = ?`;
    let params = [req.body.fName, req.body.lName, 
                req.body.birthDate, req.body.deathDate || null,
                req.body.sex, req.body.profession,
                req.body.country, req.body.portrait,
                req.body.biography, req.body.authorId,
                ];
    const [rows] = await pool.query(sql, params);
    res.redirect("/authors");
});

app.get("/author/new", (req, res) => {
    res.render("newAuthor");
});

// route to delete authors
app.get("/author/delete", async function(req, res) {
    let authorId = req.query.authorId;
    let sql = `
        DELETE
        FROM q_authors
        WHERE authorId = ?`;
    const [rows] = await pool.query(sql, [authorId]);

    res.redirect("/authors");
});

app.listen(3000, ()=>{
    console.log("Express server running")
});
