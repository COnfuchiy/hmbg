/**
 * Created by Dima on 25.09.2019.
 */

const express = require('express');
const router = express.Router();
const classes = require('../components/main_classes');
const log = require('../components/log_comp');
const User = classes.User;
const Family_db = classes.Family_db;
const Budget_db = classes.Budget_db;


router.post('/', function (req, res) {
    let new_user = new User({username:req.body.username, password:req.body.password, email:req.body.email,
        family_aff:req.body.family_aff});
    new_user.save(function (err) {
        if (err)
            log.base_err(new Date(), err);
        else
            log.create_user(new Date(), req.body.username, req.body.family_aff);
    });
    if (req.body.state_family === 'create') {
        let new_budget = new Budget_db({current_family: req.body.family_aff, material_status: 0});
        new_budget.save(function (err) {
            if (err)
                log.base_err(new Date(), err);
            else {
                let new_family = new Family_db(
                    {
                        surname: req.body.family_aff,
                        creator_family: req.body.username,
                        family_members: [req.body.username],
                        budget: new_budget._id
                    }
                );
                new_family.save(function (err) {
                    if (err)
                        log.base_err(new Date(), err);
                    else{
                        log.create_family_log(new Date(), req.body.family_aff, req.body.username);
                        res.json({state:'oks'});
                    }
                });
            }
        });
    }
    if (req.body.state_family === 'have') {
        Family_db.findOne({surname: req.body.family_aff}, function (err, family) {
            family.family_members.push(req.body.username);
            family.save(function (err) {
                if (err)
                    log.base_err(new Date(), err);
                else {
                    log.update_elem(new Date(), req.body.family_aff, 'Family', req.body.family_aff, 'append user:' + req.body.username);
                }
            });
        });
        res.json({state: 'oks'})
    }
    if (req.body.state_family === 'not') {
        //no idea
    }
});
router.post('/username', function (req, res) {
    console.log(req.body.username);
    User.findOne({username:req.body.username}, function (err, user) {
        if (err)
            log.base_err(new Date(), err);
        if (!user)
            res.json({state:'oks'});
        else
            res.json({state:'occupied'});

    })
});
module.exports = router;