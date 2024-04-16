const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.DATABASE_TEST || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
    const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
    const values = {$timesheetId: timesheetId};
    db.get(sql, values, (err, timesheet) => {
        if(err){
            next(err);
        }else if(timesheet){
            next();
        }else {
            res.sendStatus(404);
        }
    });
});

timesheetsRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId';
    const values = {$employeeId: req.params.employeeId};
    db.all(sql, values, (err, timesheets) => {
        if(err){
            next(err);
        } else{
            res.status(200).json({timesheets: timesheets});
        }
    });
});

timesheetsRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.params.employeeId;
    const employeeSql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
    const employeeValues = {$employeeId: employeeId};
    db.get(employeeSql, employeeValues, (err, employee) => {
        if(err){ 
            next(err);
        } else if(!hours || !rate || !date || !employee){
            res.sendStatus(400);
        } else{
            const timesheetSql = 'INSERT INTO Timesheet (hours, rate, date, employee_id) ' +
            'VALUES ($hours, $rate, $date, $employeeId)';
            const timesheetValues = {
                $hours: hours,
                $rate: rate,
                $date: date,
                $employeeId: employeeId
            };
            db.run(timesheetSql, timesheetValues, (err) => {
                if(err) {
                    next(err);
                } else{
                    db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`, (err, timesheet) => {
                        res.status(201).json({timesheet: timesheet});
                    });
                }
            });
        }
    });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.body.timesheet.employeeId;
    const employeeSql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
    const employeeValues = {$employeeId: employeeId};
    db.get(employeeSql, employeeValues, (err, employee) => {
        if(err) {
            next(err);
        } else if(!hours || !rate || !date || !employee){
            res.sendStatus(400);
        } else{
            const timesheetSql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE Timesheet.id = $timesheetId';
            const timesheetValues = {
                $hours: hours,
                $rate: rate,
                $date: date,
                $employeeId: employeeId,
                $timesheetId: req.params.timesheetId
            };
            db.run(timesheetSql, timesheetValues, (err) => {
                if(err) {
                    next(err);
                } else{
                    db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`, (err, timesheet) => {
                        res.status(200).json({timesheet: timesheet});
                    });
                }
            });
        }
    });
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId';
    const values = {$timesheetId: req.params.timesheetId};
  
    db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        res.sendStatus(204);
      }
    });
  });

module.exports = timesheetsRouter;