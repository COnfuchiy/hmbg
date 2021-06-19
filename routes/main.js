/**
 * Created by Dima on 18.09.2019.
 */
const express = require('express');
const router = express.Router();
const log = require('../components/log_comp');
const classes = require('../components/main_classes');
const Family_db = classes.Family_db;
const Budget_db = classes.Budget_db;
const User = classes.User;
const Budget = classes.Budget;
const fs = require('fs');

router.get('/', function (req, res) {
    Family_db.findOne({surname: req.session.family}).then(function (family, err) {
            if (err)
                log.base_err(new Date(), err);
            else {
                Budget_db.findOne({_id: family.budget}).then(function (bg, err) {
                    if (err) {
                        log.base_err(new Date(), err);
                        res.json({state: err});
                    }
                    else {
                        let budget = new Budget(bg.current_family, bg.material_status, bg.categories,
                            bg.ap_categories ,bg.credits);
                        //Budget_db.updateOne({_id: family.budget}, {categories:[bg.categories[2]], ap_categories:[bg.ap_categories[5]],credits:[bg.credits[5]]}, err=> {
                        //    if (err)
                        //        log.base_err(new Date(), err);
                        //});
                        res.json({bg:budget});
                        //res.json({bg:budget.calculate_budget(req.session.user)});
                    }
                });
            }
        }
    );
});
//mb rethink this ship
router.get('/events', function (req, res) {
    fs.readFile('C:\\Users\\Дмитрий\\WebstormProjects\\hmbg\\logs\\' + req.session.family + '.txt', (err, data) => {
        if (err)
            log.base_err(new Date(), err);
        else {
            User.find({family_aff: req.session.family}, (err, users) => {
                if (err)
                    log.base_err(new Date(), err);
                else {
                    if (users) {
                        let users_array = {};
                        for (let user of users)
                            users_array[user.username] = user;
                        let logs_array = data.toString().split('\n');
                        for (let i = logs_array.length-1; i >= 0; i--) {
                            logs_array[i] = log.unpack(logs_array[i]);
                            if (logs_array[i] !== '')
                                if (users_array[logs_array[i].creator].name)
                                    logs_array[i].creator = users_array[logs_array[i].creator].name + '(' + logs_array[i].creator + ')';
                        }
                        console.log(logs_array);
                        res.json(logs_array.reverse());
                    }
                }
            });
        }

    });
});
router.get('/test', function (req, res) {
    Family_db.findOne({surname: req.session.family}).then(function (family, err) {
            if (err) {
                log.base_err(new Date(), err);
                console.log(err);
                res.json({state: err});
            }
            else {
                Budget_db.findOne({_id: family.budget}).then(function (bg, err) {
                    if (err) {
                        log.base_err(new Date(), err);
                        console.log(err);
                        res.json({state: err});
                    }
                    else {
                        res.json({bg:bg});
                        let budget = new Budget(bg.current_family, bg.material_status, [],
                            [], []);
                        budget.create_new_category(bg, 'Ремонт', req.session.username);
                        budget.get_category('Ремонт').append_consum(req.session.username, 'Обои', 1200);
                        budget.create_new_ap_category(bg, 'Комуналочка', req.session.username, 4500, 20);
                        budget.create_new_credit(bg, 'Епотека', 500000, 21, 2400, req.session.username);
                        res.json({state: 'oks'});
                    }
                });
            }
        }
    );
});
module.exports = router;
