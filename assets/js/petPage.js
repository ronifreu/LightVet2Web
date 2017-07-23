var serverAddress = 'http://localhost:51714'

$(document).ready(function() {
    console.log(localStorage.getItem('pet_id'));
    petInfo.init();
    appointmentInfo.init();
    addAppointment.init();
});

var petInfo = {
    init :     function(){
        $.ajax(serverAddress+'/api/Pet/GetPetsByIdentifiers',{
            data: {"identifiersList[0]": localStorage.getItem('pet_id')},
            success: function (response) {
                petInfo.showPet(response[0]);
            },
            error: function(request, errorType, errorMessage) {
                console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                alert(request.responseText)
            }
        })
    },

    showPet: function (pet) {
        console.log(pet);
        $('#pet_details').html("Name: " + pet.Name + "<br>Color: " + pet.Color + "<br>Breed:  " + pet.Breed+ "<br>Chip Number:  " + pet.ChipIdentifier);
    }
}

var appointmentInfo = {
    init : function(){
        $.ajax(serverAddress+'/api/Appointment/GetAppointmentsByPetIdentifier',{
            data: {"petIdentifier": localStorage.getItem('pet_id')},
            success: function (response) {
                console.log(response);
                appointmentInfo.showAppointments(response);
            },
            error: function(request, errorType, errorMessage) {
                console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                alert(request.responseText)
            }
        })
    },
    showAppointments: function (appointments) {
        console.log(appointments);
        var rendered = "";
        var template = '<tr class="appointment_row">'+
            '<td>{{timeCreated}}</td>'+
            '<td>{{appointmentTitle}}</td>'+
            '<td>{{appointmentType}}</td>'+
            '</tr>'+
            '<tr style="display: none"><td colspan="3">{{appointmentSummery}}</td></tr>';


        appointments.forEach(function(el){
            console.log("Build HTML call");
            rendered = rendered + Mustache.render(template, {identifier : el.Identifier,appointmentTitle : el.AppointmentTitle,appointmentSummery : el.AppointmentSummery,timeCreated : appointmentInfo.dateStringToNiceString(el.TimeCreated),appointmentType : el.Type});
        });
        $('#appointments_list_block').html(rendered);
        this.appointmentListBehavior();
    },

    appointmentListBehavior : function () {
        $('.appointment_row').on('click', function () {
            $(this).next().slideToggle(10);
        })
    },

    dateStringToNiceString: function (date) {
        //console.log(date);
        //return date;
        var date = new Date(date);
        return (date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + "  " + (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()));
    }

}

var addAppointment = {
    init: function () {
        $('#add_appointment_form').on('submit', this.sendAddAppointmentForm)
    },
    sendAddAppointmentForm: function (event) {
        event.preventDefault();
        console.log($('input[name="appointmentType"]:checked').data('val'));
        $.ajax(serverAddress+'/api/Appointment/AddAppointment',{
            type: 'POST',
            data: {"OwnerIdentifier":  localStorage.getItem('owner_id'),
                "PetIdentifier":  localStorage.getItem('pet_id'),
                "AppointmentTitle":  $('#appointmentTitle').val(),
                "Identifier":  "",
                "TimeCreated": "",
                "TimeModified": "",
                "AppointmentSummery":  $('#appointmentSummery').val(),
                "Type":  $('input[name="appointmentType"]:checked').data('val')},
            success: function (response) {
                appointmentInfo.init();
                alert("Appointment  added");
            },
            error: function(request, errorType, errorMessage) {
                console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                alert(request.responseText);
            }
        })

    }
}





