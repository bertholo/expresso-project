const express = require('express');
const employeesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.DATABASE_TEST || './database.sqlite');

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
    db.get('SELECT * FROM Employee WHERE Employee.id=$employeeId', {$employeeId: employeeId}, (err, employee) => {
        if(err){
            next(err);
        } else if (employee){
            req.employee = employee;
            next();
        } else{
            sendStatus(404);
        }
    });
});

employeesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (err, employees) => {
        if (err) {
            next(err);
        } else{
            res.status(200).json({employees: employees});
        }
    });
});

employeesRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if(!name || !position || !wage) {
        res.sendStatus(400);
    }
    const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) ' + 
    'VALUES ($name, $position, $wage, $isCurrentEmployee)';
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee
    };
    db.run(sql, values, (err) => {
        if(err) {
            next(err);
        } else{
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, (err, employee) => {
                res.status(201).json({employee: employee});
            });
        }
    });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({employee: req.employee});
});

employeesRouter.put('/:employeeId', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if(!name || !position || !wage) {
        res.sendStatus(400);
    }

    const sql = 'UPDATE Employee SET name = $name, position = $position, ' +
    'wage = $wage, is_current_employee = $isCurrentEmployee WHERE Employee.id = $employeeId';
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee,
        $employeeId: req.params.employeeId
    };
    db.run(sql, values, (err) => {
        if(err) {
            next(err);
        } else{
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (err, employee) => {
                res.status(200).json({employee: employee});
            });
        }
    })

});

employeesRouter.delete('/:employeeId', (req, res, next) => {
    const sql = 'UPDATE Employee SET is_current_employee = 0 WHERE id = $employeeId';
    const values = {$employeeId: req.params.employeeId};
    db.run(sql, values, (err) => {
        if(err) {
            next(err);
        } else{
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, employee) => {
                if(err){
                    next(err);
                } else if(employee !== null){
                    res.sendStatus(204);
                } else{
                    res.sendStatus(404);
                }
            });
        }
    });
});

module.exports = employeesRouter;