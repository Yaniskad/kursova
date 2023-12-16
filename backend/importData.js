const fs = require('fs');
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'T#97@phP',
    database: 'signup'
});

// Читання JSON файлу
const rawData = fs.readFileSync('answers.json');
const jsonData = JSON.parse(rawData);

// Створення таблиці, якщо її не існує
const createTableSQL = `
    CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        timeStamp VARCHAR(255),
        answers JSON
    )
`;

db.query(createTableSQL, (err, result) => {
    if (err) throw err;
    console.log('Таблицю applications створено або вже існує');
});

// Імпорт даних в базу даних
jsonData.forEach((entry) => {
    const sql = 'INSERT INTO applications (timeStamp, answers) VALUES (?, ?)';
    const values = [entry.timeStamp, JSON.stringify(entry.answers)];

    db.query(sql, values, (err, result) => {
        if (err) throw err;
        console.log('Дані імпортовано: ', result);
    });
});

db.end();
