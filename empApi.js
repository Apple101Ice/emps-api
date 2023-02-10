const { Client } = require('pg');
const format = require("pg-format");

let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
const port = process.env.PORT || 2410;

app.listen(port, () => console.log(`Node app listening on port ${port}!`));

const client = new Client({
    user: "root",
    password: "xAZjZm0YI1ATiLGZwabXsZYF2jqGMWuz",
    database: "testdb_ncdn",
    port: 5432,
    host: "dpg-cfidrokgqg40klnee660-a.singapore-postgres.render.com",
    ssl: { rejectUnauthorized: false }
});

let { employeesData } = require("./employeesData.js");

client.connect(err => {
    if (err) console.log("Connection Error");
    else console.log("Connected");
});

app.get("/svr/employees/resetData", function (req, response) {
    let sql = "DELETE FROM Employees";
    client.query(sql, function (err, resQuery) {
        if (err) response.status(404).send(err.message);
        else {
            let arr = employeesData.map(e1 => [e1.empCode, e1.name, e1.department, e1.designation, e1.salary, e1.gender]);
            let sql1 = format("INSERT INTO Employees (empCode,name,department,designation,salary,gender) VALUES %L RETURNING *", arr);
            client.query(sql1, function (err, resQuery) {
                if (err) response.status(404).send(err.message);
                else response.send("Data Reset");
            });
        }
    });
});

app.get("/svr/employees", function (req, response) {
    let sql = "SELECT * FROM employees";
    client.query(sql, function (err, res) {
        if (err) response.status(404).send(err);
        else response.send(res.rows);
    });
});

app.get("/svr/employees/filter", function (req, res) {
    const department = req.query.department;
    const designation = req.query.designation;
    const gender = req.query.gender;
    let sql = "SELECT * FROM Employees WHERE ";
    let condParams = "";

    if (department) {
        condParams += condParams ? " AND" : "";
        condParams += format(" department = %L", department);
    }
    if (designation) {
        condParams += condParams ? " AND" : "";
        condParams += format(" designation = %L", designation);
    }
    if (gender) {
        condParams += condParams ? " AND" : "";
        condParams += format(" gender = %L", gender);
    }

    sql += condParams;
    client.query(sql, function (err, result) {
        if (err) res.status(404).send(err.message);
        else
            res.send(result.rows);
    });
});

app.get("/svr/employees/:id", function (req, response) {
    let id = +req.params.id;
    let sql = format("SELECT * FROM Employees WHERE empCode = %L", id);
    client.query(sql, function (err, res) {
        if (err) response.status(404).send(err);
        else response.send(res.rows[0]);
    });
});

app.get("/svr/employees/department/:department", function (req, response) {
    let department = req.params.department;
    let sql = format("SELECT * FROM Employees WHERE department = %L", department);
    client.query(sql, function (err, res) {
        if (err) response.status(404).send(err);
        else response.send(res.rows);
    });
});

app.get("/svr/employees/designation/:designation", function (req, response) {
    let designation = req.params.designation;
    let sql = format("SELECT * FROM Employees WHERE designation = %L", designation);
    client.query(sql, function (err, res) {
        if (err) response.status(404).send(err);
        else response.send(res.rows);
    });
});

app.post("/svr/employees", function (req, res) {
    let e1 = req.body;
    let params = [e1.empCode, e1.name, e1.department, e1.designation, e1.salary, e1.gender];
    let sql = format("INSERT INTO Employees (empCode,name,department,designation,salary,gender) VALUES (%L)", params);
    client.query(sql, function (err, result) {
        if (err) res.status(404).send(err.message);
        else
            res.send(result.rows);
    });
});

app.put("/svr/employees/:id", function (req, response) {
    let body = req.body;
    let id = +req.params.id;
    let sql = format("SELECT * FROM Employees WHERE empCode = %L", id);
    client.query(sql, function (err, res) {
        if (err) response.status(404).send(err);
        else {
            let updatedemp = { ...res.rows[0], ...body };
            let { name, department, designation, salary, gender } = updatedemp;
            let sql1 = format(
                "UPDATE Employees SET name = %L, department = %L, designation = %L, salary = %L, gender = %L WHERE empCode = %L",
                name, department, designation, salary, gender, id
            );
            client.query(sql1, function (err, res) {
                if (err) response.status(404).send(err);
                else response.send(res.rows[0]);
            });
        }
    });
});

app.delete("/svr/employees/:id", function (req, res) {
    let id = +req.params.id;
    let sql = format("DELETE FROM Employees WHERE empCode = %L", id);
    client.query(sql, function (err, result) {
        if (err) res.status(404).send(err.message);
        else
            res.send("Successfully Deleted Id " + id);
    });
});
