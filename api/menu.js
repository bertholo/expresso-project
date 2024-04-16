const express = require('express');
const menuRouter = express.Router();

const sqlite3 = require('sqlite3');
const menuItemsRouter = require('./menu-items');
const db = new sqlite3.Database(process.env.DATABASE_TEST || './database.sqlite');

menuRouter.use('/:menuId/menu-items', menuItemsRouter);

menuRouter.param('menuId', (req, res, next, menuId) => {
    const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    const values = {$menuId: menuId};
    db.get(sql, values, (err, menu) => {
        if(err){
            next(err);
        } else if (menu) {
            req.menu = menu;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

menuRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu', (err, menus) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({menus: menus});
        }
    });
});

menuRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if(!title) {
        res.sendStatus(400);
    }
    const sql = 'INSERT INTO Menu (title) VALUES ($title)';
    const values = {$title: title};
    db.run(sql, values, (err) => {
        if(err){
            next(err);
        } else{
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, (err, menu) => {
                res.status(201).json({menu: menu});
            });
        }
    });
});

menuRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});
});

menuRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;
    if(!title) {
        res.sendStatus(400);
    }
    const menuSql = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuId';
    const menuValues = {
        $title: title,
        $menuId: req.params.menuId
    };
    db.run(menuSql, menuValues, (err) => {
        if(err) {
            next(err);
        } else{
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, (err, menu) => {
                if(err) {
                    res.sendStatus(404);
                } else{
                    res.status(200).json({menu: menu});
                }
            });
        }
    });
});

menuRouter.delete('/:menuId', (req, res, next) => {
    const menuItemSql = 'SELECT * FROM Menu_item WHERE Menu_item.menu_id = $menuId';
    const menuItemValues = {$menuId: req.params.menuId};
    db.get(menuItemSql, menuItemValues, (err, menuItem) => {
        if(err) {
            next(err);
        } else if(menuItem){
            res.status(400).send('Delete menu items first.');
        } else{
            const sql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
            const values = {$menuId: req.params.menuId};
                db.run(sql, values, (err) => {
                    if(err){
                        next(err);
                    } else{
                        res.sendStatus(204);
                    }
                });
        }
    });
});


module.exports = menuRouter;