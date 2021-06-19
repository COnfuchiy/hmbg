/**
 * Created by Dima on 27.09.2019.
 */

const fs = require('fs');

class Log {
    static path() {
        return "C:\\Users\\Дмитрий\\WebstormProjects\\hmbg";
    }

    static log_note(date, data) {
        return '---|' + date.toJSON().slice(0, 10) + '-' + date.toTimeString().slice(0, 8) + '-' + data + '|---\n';
    };

    static connect_server(time, port, url) {
        fs.appendFileSync(Log.path() + '/logs/main_log.txt',
            Log.log_note(time, 'Server connect to ' + port + ' ' + url));
    }

    static connect_mongo(time, url, state) {
        fs.appendFileSync(Log.path() + '/logs/main_log.txt',
            Log.log_note(time, 'Mongo connect:' + state.toString() + ':' + url));
    }

    static base_err(time, error) {
        fs.appendFileSync(Log.path() + '/logs/main_log.txt',
            Log.log_note(time, 'ERROR!:' + error));
    }

    static create_family_log(time, family_surname, creator) {
        fs.openSync(
            Log.path() + '/logs/' + family_surname + '.txt', 'a+'
        );
        fs.appendFileSync(Log.path() + '/logs/' + family_surname + '.txt',
            Log.log_note(time, 'New family :' + family_surname + ': create by :' + creator));
    }

    static create_user(time, username, family_surname = undefined) {
        fs.appendFileSync(Log.path() + '/logs/main_log.txt',
            Log.log_note(time, 'User :' + username + ': create to ' + ('family:' + family_surname ? family_surname : 'no family')));
    }

    static create_element(time, type_elem, name_elem, family_surname, creator) {
        fs.appendFileSync(Log.path() + '/logs/' + family_surname + '.txt',
            Log.log_note(time, type_elem + ' :' + name_elem + ': create by :' + creator));
    }

    static append_consum(time, cat_name, cons_name, family_surname, value, creator) {
        fs.appendFileSync(Log.path() + '/logs/' + family_surname + '.txt',
            Log.log_note(time, 'Consumption :' + cons_name + ': value of :'+value+': append to :' + cat_name + ': by :' + creator));
    }

    /*
    whats maybe update:
    1.Name for consumption : "'change name:with '+old_name+' on '+ new_name"
           for after : same here
    2.Category for consumption :"'change category:with '+old_cat_name+' on '+ new_cat_name'"
    3.Value for consumption in category and ap_category:"'change value:with '+old_value+' on '+ new_value"
            for credit "'change credit value:with '+old_value+' on '+ new_value"
            for ap_category:"'change ap_category value:with '+old_value+' on '+ new_value"
    4.Data(start_date,planned_pay) for credit:"''change '+type_data+':with '+old_value+' on '+ new_value""
    5.Date for consumption:"'change date:with '+old_date+' on '+ new_date"
    6.Ap_date(payday) for ap_category:"'change ap_date:with '+old_date+' on '+ new_date"
                      for credit:"'change payday:with '+old_date+' on '+ new_date"
    7.another and another...

    */
    static update_consum(time, family_surname, cat_name, name_elem, what_upd, creator) {
        fs.appendFileSync(Log.path() + '/logs/' + family_surname + '.txt',
            Log.log_note(time, 'Consumption :' + name_elem + ': in :' + cat_name +
                         ': was update - ' + what_upd + '- by :' + creator));
    }

    static update_elem(time, family_surname, type_elem, name_elem, what_upd, creator) {
        fs.appendFileSync(Log.path() + '/logs/' + family_surname + '.txt',
            Log.log_note(time, type_elem + ' :' + name_elem + ': was update - ' + what_upd + '- by :' + creator));
    }

    static unpack(note) {
        let ret_value = {};
        ret_value.date = note.slice(4,23);
        if (note.includes('New family')) {
            ret_value.creator = note.slice(note.lastIndexOf(':')+1, note.lastIndexOf('|'));
            ret_value.state = 'Family create';
            return ret_value;
        }
        if (note.includes('Consumption')) {
            if (note.includes('append to')) {
                ret_value.cons_name = note.slice(note.indexOf(':') + 1, note.indexOf(': value of :'));
                ret_value.value_consum = note.slice(note.indexOf(': value of :') + 12, note.indexOf(': append to :'));
                ret_value.caterogy_name = note.slice(note.indexOf(': append to :') + 13, note.indexOf(': by :'));
                ret_value.creator = note.slice(note.lastIndexOf(':'), note.lastIndexOf('|'));
                ret_value.state = 'Append consumption';
                return ret_value;
            }
            if (note.includes('was update')) {
                ret_value.cons_name = note.slice(note.indexOf(':') + 1, note.indexOf(': in :'));
                ret_value.caterogy_name = note.slice(note.indexOf(': in :') + 6, note.indexOf(': was update - '));
                ret_value.what_upd = note.slice(note.indexOf(': was update - ')+15,note.indexOf('- by :'));
                ret_value.creator = note.slice(note.lastIndexOf(':'), note.lastIndexOf('|'));
                ret_value.state = 'Update consumption';
                return ret_value;
            }
        }
        if (note.includes('Credit')) {
            ret_value.state = 'Credit was ';
        }
        if (note.includes('Category')) {
            ret_value.state = 'Category was ';
        }
        if (note.includes('AP_Category')) {
            ret_value.state = 'AP_Category was ';
        }
        if (note.includes(': was update - ')){
            ret_value.elem_name = note.slice(note.indexOf(' :') + 2, note.indexOf(': was update - '));
            ret_value.what_upd = note.slice(note.indexOf(': was update - ')+15,note.indexOf('- by :'));
            ret_value.state+='update';
        }
        else{
            ret_value.elem_name = note.slice(note.indexOf(' :') + 2, note.indexOf(': create by :'));
            ret_value.state+='create';
        }
        ret_value.creator = note.slice(note.lastIndexOf(':')+1, note.lastIndexOf('|'));
        return ret_value;

    }
}
module.exports = Log;