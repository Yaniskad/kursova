const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const fs = require("fs");
const { google } = require("googleapis");
const service = google.sheets("v4");
const credentials = require("./credentials.json");

// Configure auth client
const authClient = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
);

(async function () {
    try {

        // Authorize the client
        const token = await authClient.authorize();

        // Set the client credentials
        authClient.setCredentials(token);

        // Get the rows
        const res = await service.spreadsheets.values.get({
            auth: authClient,
            spreadsheetId: "1N-njWwjiUkSJQvtuCL-yhq8glXOqV5KE4KKx72sFLsU",
            range: "A:I",
        });

        // All of the answers
        const answers = [];

        // Set rows to equal the rows
        const rows = res.data.values;

        // Check if we have any data and if we do add it to our answers array
        if (rows.length) {

            // For each row
            for (const row of rows) {
                const userAnswers = row.slice(1);  
                answers.push({ timeStamp: row[0], answers: userAnswers });
            }

        } else {
            console.log("No data found.");  
        }

        // Saved the answers
        fs.writeFileSync("answers.json", JSON.stringify(answers), function (err, file) {
            if (err) throw err;
            console.log("Saved!");
        });

    } catch (error) {

        // Log the error
        console.log(error);

        // Exit the process with error
        process.exit(1);

    }

})();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "T#97@phP",
    database: "signup"
})

app.get("/application-status/:userId", (req, res) => {
    const userId = req.params.userId;

    db.query('SELECT status FROM applications WHERE userId = ?', [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Помилка сервера' });
        }

        if (results.length > 0) {
            const userStatus = results[0].status;
            res.json({ status: userStatus });
        } else {
            res.status(404).json({ error: "Користувач не знайдений" });
        }
    });
});



app.post ('/signup', (req, res) => {
    const sql = "INSERT INTO login (`name`, `email`, `password`) VALUES(?, ?, ?)";
    const values = [
        req.body.name, 
        req.body.email,
        req.body.password
    ];
    
    console.log("Received registration request:", values);

    db.query(sql, values, (err, data) =>{

        if(err) {
            console.log(err);
            return res.json(data);
        }
        return res.json(data);
    })
})
app.post('/login', (req, res) => {
    const sql = "SELECT * FROM login WHERE `email`= ? AND `password` = ?";
    const values = [req.body.email, req.body.password]; // Use an array for parameters

    db.query(sql, values, (err, data) => {
        if (err) {
            return res.json(err);
        }
        if (data.length > 0) {
            return res.json(data);
        } else {
            return res.status(404).json({ error: "Користувач не знайдений" });
        }
    });
});


app.get('/get-users', (req, res) => {
    const selectSql = "SELECT * FROM login";

    db.query(selectSql, (err, results) => {
        if (err) {
            return res.json("Error");
        }

        return res.json(results);
    });
});
app.listen(8081, () => {
    console.log ("listening");
})