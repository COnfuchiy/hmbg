/**
 * Created by Dima on 02.09.2019.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Log = require('../components/log_comp');

//person schema
const User_sch = new Schema({
    username: String,
    name: String,
    family_aff: {
        type: String,
        default: 'no family',
    },
    password: String,
    email: {
        type: String,
        default: 'No mail'
    },
});
const User_db = mongoose.model("User_db", User_sch);


class Budget {
    constructor(family_surname, material_status, categories, ap_categories, credits) {
        this._current_family = family_surname;
        this._material_status = material_status;
        this._categories = Array.from(categories);
        for (let i = 0; i < this._categories.length; i++)
            if (this._categories[i] !== null)
                this._categories[i] = new Category(this._categories[i].family_aff, this._categories[i].category_name,
                    this._categories[i].start_date);
        this._ap_categories = Array.from(ap_categories);
        for (let i = 0; i < this._ap_categories.length; i++)
            if (this._categories[i] !== null)
                this._ap_categories[i] = new AP_Category(this._ap_categories[i].family_aff, this._ap_categories[i].category_name,
                    this._ap_categories[i].start_date, this._ap_categories[i].ap_date, this._ap_categories[i].value, this._ap_categories[i].num_pay);
        this._credits = Array.from(credits);
        for (let i = 0; i < this._credits.length; i++)
            if (this._categories[i] !== null)
                this._credits[i] = new Credit(this._credits[i].family_aff, this._credits[i].name, this._credits[i].value, this._credits[i].start_date, this._credits[i].payday,
                    this._credits[i].last_balanced, this._credits[i].last_pay, this._credits[i].planned_pay, this._credits[i].balance);
    }

    get categories() {
        return this._categories;
    }

    get ap_categories() {
        return this._ap_categories;
    }

    get credits() {
        return this._credits;
    }

    get_category(name) {
        return this._categories[3];
    }

    get_ap_category(name) {
        return this._ap_categories.find(item => item.category_name === name);
    }

    get_credit(name) {
        return this._credits.find(item => item.name === name);
    }

    create_new_category(budget, cat_name, cur_user) {
        let new_category = {
            family_aff: this._current_family,
            category_name: cat_name,
            start_date: new Date(),
        };
        let tmp_bg = Array.from(budget.categories);
        tmp_bg.push(new_category);
        Budget_db.updateOne({current_family: this._current_family}, {categories: tmp_bg}, err => {
            if (err)
                Log.base_err(new Date(), err);
            else {
                this._categories.push(new Category(cat_name, this._current_family, new_category.start_date));
                Log.create_element(new Date(), 'Category', cat_name, this._current_family, cur_user);
            }
        });

    }

    create_new_ap_category(budget, cat_name, cur_user, ap_value, ap_date) {
        let new_ap_category = {
            family_aff: this._current_family,
            category_name: cat_name,
            start_date: new Date(),
            ap_date: ap_date,
            value: ap_value,
            num_pay: 0
        };
        budget.ap_categories.push(new_ap_category);
        Budget_db.updateOne({current_family: this._current_family}, {ap_categories: budget.ap_categories}, err => {
            if (err)
                Log.base_err(new Date(), err);
            else {
                this._ap_categories.push(new AP_Category(cat_name, this._current_family, new_ap_category.start_date,
                    new_ap_category.ap_date, new_ap_category.value, 0));
                Log.create_element(new Date(), 'AP_Category', cat_name, this._current_family, cur_user);
            }
        });
    }

    create_new_credit(budget, name, value, payday, planned_pay, cur_user) {
        let cur_date = new Date();
        let new_credit = {
            family_aff: this._current_family,
            name: name,
            value: value,
            start_date: cur_date,
            payday: payday,
            last_balanced: cur_date,
            last_pay: 0,
            planned_pay: planned_pay,
            balance: 0,
        };
        budget.credits.push(new_credit);
        Budget_db.updateOne({current_family: this._current_family}, {credits: budget.credits}, err => {
            if (err)
                Log.base_err(new Date(), err);
            else {
                this._credits.push(new Credit(this._current_family, name, value, new_credit.start_date, payday, planned_pay));
                Log.create_element(new Date(), 'Credit', name, this._current_family, cur_user);
            }
        });
    }

    calculate_budget(current_person) {
        let cur_bd_state = {all_consumption: 0};
        if (this._categories.length === 0 && this._ap_categories.length === 0 && this._credits.length === 0)
            return {state: 'no consumption'};
        for (let cat of this._categories) {
            cur_bd_state[cat.name] = cat.calc_lasted_consem();
            cur_bd_state.all_consumption += cur_bd_state[cat.name];
        }
        for (let ap_cat of this._ap_categories) {
            ap_cat.auto_pay(current_person);
            cur_bd_state[ap_cat.name] = ap_cat.calc_lasted_consem();
            cur_bd_state.all_consumption += cur_bd_state[ap_cat.name];
        }
        for (let credit of this._credits) {
            credit.check_balance();
            let last_payment = credit.last_payment();
            cur_bd_state[credit.name] = last_payment;
            if (typeof (last_payment === "number"))
                cur_bd_state.all_consumption += credit.last_payment(); //create this
        }
        this._materital_status = cur_bd_state.all_consumption;
        return cur_bd_state;
    }
}

//budget schema
const Budget_sch = new Schema({
    current_family: String,
    material_status: Number,
    categories: {
        type: [{
            family_aff: String,
            category_name: String,
            start_date: Date
        }], default: []
    },
    ap_categories: {
        type: [{
            family_aff: String,
            category_name: String,
            start_date: Date,
            ap_date: Number,
            value: Number,
            num_pay: Number
        }], default: []
    },
    credits: {
        type: [{
            family_aff: String,
            name: String,
            value: Number,
            start_date: Date,
            payday: Number,
            last_balanced: Date,
            last_pay: Number,
            planned_pay: Number,
            balance: Number,
        }], default: []
    }
});
const Budget_db = mongoose.model("budget_db", Budget_sch);
//end schema

class Family {
    constructor(surname, creator, budget, family_members = []) {
        this._surname = surname;
        this._creator_family = creator;
        this._budget = budget;
        this._family_members = family_members;
        //this.add_person(creator);
        //this.create_budget(this);
    }

    get surname() {
        return this._surname;
    }

    get creator_family() {
        return this._creator_family;
    }

    add_person(person) {
        if (this._family_members === undefined)
            this._family_members = [];
        this._family_members.push(person);
        this._num_members++;
    }

    get_list_persons() {
        return this.family_members ? this.family_members !== undefined : this.family_members = [];
    }

    create_budget(family) {
        this._budget = new Budget(family);
    }

    get budget() {
        return this._budget;
    }

    view_cur_state() {
        return this._budget.calculate_budget(this);
    }
}

//family schema
const Family_sch = new Schema({
    surname: String,
    creator_family: String,
    family_members: [String], //array username members
    budget: {type: Schema.Types.ObjectId, ref: 'Budget_db'}
});
const Family_db = mongoose.model("Family_db", Family_sch);
//

class Category {
    constructor(cat_name, family_aff, start_date) {
        this._category_name = cat_name;
        this._family_aff = family_aff;
        this._start_date = start_date;
    }

    get name() {
        return this._category_name;
    }

    set name(value) {
        this._category_name = value;
    }

    get_list_consumptions(months) {
        let cur_date = new Date();
        let current_consumptions;
        if (months === 1)
            Consumption.where('date').gte(cur_date.setMonth(cur_date.getMonth(), 1)).lte(cur_date).exec(function (err, consumptions) {
                if (err)

                    current_consumptions = consumptions;
            });
        else
            Consumption.where('date').gte(cur_date.setMonth(-months)).lte(cur_date).exec(function (err, consumptions) {
                if (err)
                    return console.log(err);//logging
                current_consumptions = consumptions;
            });
        return current_consumptions;
    }

    append_consum(person, name_consum, value, date = new Date()) {
        let new_consum = new Consumption(
            {
                family_aff: this._family_aff,
                person_name: person,
                category_name: this._category_name,
                cons_name: name_consum,
                value: value,
                date: date
            }
        );
        new_consum.save(function (err) {
            if (err)
                return console.log(err);//logging
        });
    }

    calc_lasted_consem(num_months = 1) {
        let cons_array = this.get_list_consumptions(this, num_months);
        let ret_sum = 0;
        for (consum of cons_array) {
            ret_sum += consum.value;
        }
        return ret_sum;
    }
}

//Consumption schema
const Consumption_sch = new Schema({
    family_aff: String,
    person_name: String,
    category_name: String,
    cons_name: String,
    value: Number,
    date: Date,
});
const Consumption = mongoose.model("Consumption", Consumption_sch);
//end schema

class AP_Category extends Category {
    constructor(cat_name, family_aff, start_date, ap_date, value, num_pay) {
        super(cat_name, family_aff, start_date);
        this._value = value;
        this._ap_date = ap_date;
        this._num_pay = num_pay;
    }

    auto_pay(person) {
        let tmp_date = this._last_pay_date = this._start_date ? this._last_pay_date === undefined : this._last_pay_date;
        let current_date = new Date();
        while (current_date.getFullYear() !== tmp_date.getFullYear() ||
        (current_date.getFullYear() === tmp_date.getFullYear() &&
        current_date.getMonth() !== tmp_date.getMonth() ) ||
        (current_date.getFullYear() === tmp_date.getFullYear() &&
        current_date.getMonth() === tmp_date.getMonth() &&
        current_date.getDate() < tmp_date.getDate())) {
            this._num_pay++;
            tmp_date.setDate(this._ap_date);
            this.append_consum(this, person.name, this._category_name, this._ap_value,)
        }
        this._last_pay_date = tmp_date;
    }
}

class Credit {
    constructor(family_aff, name, value, start_date, payday, planned_pay) {
        this._family_aff = family_aff;
        this._name = name;
        this._value = value;
        this._start_date = start_date;
        this._payday = payday;
        this._last_balansed = start_date;
        this._last_pay = 0;
        this._planned_pay = planned_pay;
        this._balance = this._value;
    }

    bool_check_balance() {
        let cur_date = new Date();
        if (this._last_balansed.getFullYear() === cur_date.getFullYear()) {
            if (this._last_balansed.getMonth() === cur_date.getMonth()) {
                if (this._last_balansed.getDay() <= this._payday && cur_date.getDate() > this._payday)
                    return true;
            }
            else if (this._last_balansed.getMonth() === cur_date.getMonth() - 1) {
                if (cur_date.getDate() > this._payday)
                    return true;
            }
            else
                return true;
        }
        else
            return true;
    }

    check_balance(family_surname, person) {
        if (this.bool_check_balance(this))
            this.set_balance(this, family_surname, person);
    }

    set_balance(person) {
        this._last_pay = 0;
        this.check_payments(this, person);
        let all_balanse = this.calculate_payments(this);
        this._balanse = this._value - all_balanse.paid;
        this._last_balansed = new Date();
        //let total_sum = this._value*this._percent;
    }

    get balance() {
        return this._balanse;
    }

    get_debt() {
        this.check_payments(this);
        let all_balanse = this.calculate_payments(this);
        return all_balanse.not_paid;
    }

    get name() {
        return this._name;
    }

    check_payments(person) {
        while (this.bool_check_balance(this)) {
            this.append_payment(person, 0, this._last_balansed);
            this._last_balansed.setMonth(this._last_balansed.getMonth() + 1);
        }
    }

    append_payment(person, value, date = new Date()) {
        let new_consum = new Consumption({
            family_aff: this._family_aff,
            person_name: person,
            category_name: this._name,
            cons_name: 'Payment',
            value: value,
            date: date
        });
        new_consum.save(function (err) {
            if (err)
                return console.log(err);//logging
        });
        if (value !== 0)
            this._last_pay = value;
    }

    pay(date, value = this._planned_pay) {
        Consumption.findOne({family_aff: this._family_aff, category_name: this._name, cons_name: 'Payment', date: date},
            function (err, comsum) {
                if (err)
                    return console.log(err);//logging
                comsum.value = value;
                comsum.save();
            });
    }

    last_payment() {
        if (this._last_pay !== 0)
            return this._last_pay;
        else
            return "not to pay";
    }

    calculate_payments() {
        let payments_array = this.get_payment_list(this);
        let ret_result = {
            paid: 0,
            not_paid: 0
        };
        for (payment of payments_array) {
            ret_result.paid += payment.value;
            if (payment.value < this._planned_pay)
                ret_result.not_paid += this._planned_pay - payment.value;
        }
        return ret_result;
    }

    get_payment_list() {
        let payments;
        Consumption.find({
            family_aff: this._family_aff,
            category_name: this._name,
            cons_name: 'Payment'
        }, function (err, docs) {
            if (err)
                return console.log(err);//logging
            payments = docs;
        });
        while (!payments) {
        }
        return payments;
    }
}

//exports
module.exports = {
    User: User_db,
    Family_db: Family_db,
    Budget_db: Budget_db,
    Budget: Budget,
    Category: Category,
    AP_Category: AP_Category,
    Credit: Credit,
    Consumption: Consumption
};
//end exports