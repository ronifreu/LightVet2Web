/**
 * Created by Ronaldo on 31/07/2017.
 */

var enumConverter = {
    appointmentType : {
        fromNumToStr : function (valueToConvert) {
            return this.values[valueToConvert];
        },
        fromStrToNum : function (valueToConvert) {
            return this.values.indexOf(valueToConvert);
        },
        values : ["General","Periodic","Incident","GeneralSurgery"]
    }
}

var stringFormater = {
    dateStringToNiceStringWithTime: function (date) {
        var date = new Date(date);
        return (date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + "  " + (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()));
    },
    dateStringToNiceString: function (date) {
        var date = new Date(date);
        return (date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
    },
    dateStringToNiceAge: function (date) {
        var date = new Date(date);
        var now = new Date(Date.now());
        var yearless = 0;
        var month = (now.getMonth() - date.getMonth());
        if (month < 0){
            yearless = -1;
            month += 12;
        }
        var datenow = (now.getFullYear() - date.getFullYear() + yearless) + "." + month;
        return datenow;
    }
}