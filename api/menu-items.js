const express = require('express');
const menuItemsRouter = express.Router({ mergeParams: true });

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    const sql = 'SELECT * FROM Menu_item WHERE Menu_item.id = $menuItemId';
    const values = {$menuItemId: menuItemId};
    db.get(sql, values, (err, menuItem) => {
        if(err){
            next(err);
        }else if(menuItem){
            next();
        }else {
            res.sendStatus(404);
        }
    });
});

menuItemsRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Menu_item WHERE Menu_item.menu_id = $menuId';
    const values = {$menuId: req.params.menuId};
    db.all(sql, values, (err, menuItems) => {
        if(err){
            next(err);
        } else{
            res.status(200).json({menuItems: menuItems});
        }
    });
});

menuItemsRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const menuId = req.params.menuId;
    const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    const menuValues = {$menuId: menuId};
    db.get(menuSql, menuValues, (err, menu) => {
        if(err) {
            next(err);
        } else if(!name || !description || !inventory || !price || !menu) {
            res.sendStatus(400);
        } else{
            const menuItemSql = 'INSERT INTO Menu_item (name, description, inventory, price, menu_id) ' +
            'VALUES ($name, $description, $inventory, $price, $menuId)';
            const menuItemValues = {
                $name: name,
                $description: description,
                $inventory: inventory,
                $price: price,
                $menuId: menuId
            };
            db.run(menuItemSql, menuItemValues, (err) => {
                if(err) {
                    next(err);
                } else{
                    db.get(`SELECT * FROM Menu_item WHERE Menu_item.id = ${this.lastID}`, (err, menuItem) => {
                        res.status(201).json({menuItme: menuItem});
                    });
                }
            });
        }
    })
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const menuId = req.body.menuItem.menuId;
    const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    const menuValues = {$menuId: menuId};
    db.get(menuSql, menuValues, (err, menuItem) => {
        if(err) {
            next(err);
        } else if(!name || !description || !inventory || !price || !menuItem){
            res.sendStatus(400);
        } else{
            const menuItemSql = 'UPDATE Menu_item SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId';
            const menuItemValues = {
                $name: name,
                $description: description,
                $inventory: inventory,
                $price: price,
                $menuId: menuId
            };
            db.run(menuItemSql, menuItemValues, (err) => {
                if(err) {
                    next(err);
                } else {
                    db.get(`SELECT * FROM Menu_item WHERE Menu_item.id = ${req.params.menuItemId}`, (err, menuItem) => {
                        res.status(200).json({menuItem: menuItem});
                    });
                }
            })
        }
    });
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    const sql = 'DELETE FROM Menu_item WHERE Menu_item.id = $menuItemId';
    const values = {$menuItemId: req.params.menuItemId};
    db.run(sql, values, (err) => {
        if(err) {
            next(err);
        } else{
            res.sendStatus(204);
    
        }
    });
});

module.exports = menuItemsRouter;