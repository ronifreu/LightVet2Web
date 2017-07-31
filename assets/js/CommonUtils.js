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