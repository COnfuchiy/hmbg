/**
 * Created by Dima on 27.08.2019.
 */
const classes = require('../components/main_classes');
const User = classes.User;
const log = require('../components/log_comp');
const express = require('express');
const router = express.Router();

router.get(
    '/', function(req, res){
        if (req.session.authorized !== undefined){
            if (req.session.authorized === true)
                res.json({success:'authorized'});
            else
                res.json({success:'no_authorized'});
        }
    }
);

router.post('/', function(req, res) {
    User.findOne({username:req.body.username}, function (err, user) {
        if (err)
            log.base_err(new Date(), err);
        else {
            if (user){
                if (user.password === req.body.password){
                    req.session.authorized = true;
                    req.session.family = user.family_aff;
                    res.json({state:'oks'});
                }
                else {
                    res.json({state:'invalid'});
                }
            }
            else {
                res.json({state:'invalid'});
            }
        }
    });
});

module.exports = router;