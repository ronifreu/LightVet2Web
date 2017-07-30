var serverAddress = 'http://localhost:9021';
var appointmentsTemplatesList = [];

$(document).ready(function() {
    petInfo.init();
    appointmentInfo.init();
    addAppointment.init();
    certificatesGenerator.init();
    templateDropDown.init();
});

var petInfo = {
    init :     function(){
        $.ajax(serverAddress+'/api/Pet/GetPetsByIdentifiers',{
            data: {"identifiersList[0]": localStorage.getItem('pet_id')},
            success: function (response) {
                petInfo.showPet(response[0]);
                localStorage.setItem('chosen_pet',JSON.stringify(response[0]));
            },
            error: function(request, errorType, errorMessage) {
                console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                alert(request.responseText)
            }
        })
    },

    showPet: function (pet) {
        $('#pet_details').html("Name: " + pet.Name + "<br>Color: " + pet.Color + "<br>Breed:  " + pet.Breed+ "<br>Chip Number:  " + pet.ChipIdentifier);
    }
}

var appointmentInfo = {
    init : function(){
        $.ajax(serverAddress+'/api/Appointment/GetAppointmentsByPetIdentifier',{
            data: {"petIdentifier": localStorage.getItem('pet_id')},
            success: function (response) {
                appointmentInfo.showAppointments(response);
            },
            error: function(request, errorType, errorMessage) {
                console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                alert(request.responseText)
            }
        })
    },
    showAppointments: function (appointments) {
        var rendered = "";
        var template = '<tr class="appointment_row">'+
            '<td class="textDir textDirRtl">{{appointmentType}}</td>'+
            '<td class="textDir textDirRtl">{{appointmentTitle}}</td>'+
            '<td class="textDir textDirRtl">{{timeCreated}}</td>'+
            '</tr>'+
            '<tr style="display: none" class="textDir textDirRtl"><td colspan="3">{{appointmentSummery}}</td></tr>';


        appointments.forEach(function(el){
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
        var date = new Date(date);
        return (date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + "  " + (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()));
    }

}

var addAppointment = {
    init: function () {
        $('#add_appointment_form').on('submit', this.sendAddAppointmentForm);
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
                $('#add_appointment_form').get(0).reset();
                alert("Appointment  added");
            },
            error: function(request, errorType, errorMessage) {
                console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                alert(request.responseText);
            }
        })

    },


}

var templateDropDown = {
    init: function(){
        $('#appointment_template_picker').on('change', this.loadTemplate);
        $.ajax(serverAddress+'/api/Appointment/GetAppointmentTemplates',{
            success: this.populateTemplatesDropDown,
            error: function(request, errorType, errorMessage) {
                console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                alert(request.responseText)
            }
        })
    },

    populateTemplatesDropDown : function (response) {
        console.log("populateTemplatesDropDown call");
        appointmentsTemplatesList = response;

        var rendered = '<option value="no_template" selected="selected">No template</option>';
        var template = '<option value={{identifier}}>{{appointmentTitle}}</option>';

        response.forEach(function(el){
            rendered = rendered + Mustache.render(template, {identifier : el.Identifier,appointmentTitle : el.AppointmentTitle});
        });
        $('#appointment_template_picker').html(rendered);
    },

    loadTemplate: function () {
        var chosen_template = templateDropDown.templatesFilterByTitle($(this).val())[0];
        if(chosen_template){
             $('#appointmentSummery').val(chosen_template.AppointmentSummery);
             $('#appointmentTitle').val(chosen_template.AppointmentTitle);
        }
    },
    
    templatesFilterByTitle : function (value) {
        return appointmentsTemplatesList.filter(function(el) {
            return el.Identifier == value;
        })
    }
}

var certificatesGenerator = {
    init: function () {
        $('#generate_certificate_button').on('click',this.generateCertificate(certificateImporter.castration));
    },


    generateCertificate: function (chosen_cetificate) {
        return function (e) {
            var rendered = Mustache.render(chosen_cetificate.body, certificatesGenerator.personalDataToClass());

            var doc = new jsPDF();
            doc.setFontSize(22);
            doc.text(20, 20, chosen_cetificate.title);

            doc.setFontSize(16);
            doc.text(20, 30, rendered);

            doc.save('cert.pdf')
        };
    },

    generateCertificatePOC: function () {
        var template = "I need cert for {{pet_name}} and the owner name is {{owner_first_name}} {{owner_last_name}}";
        var chosen_pet = JSON.parse(localStorage.getItem('chosen_pet'));
        var chosen_owner = JSON.parse(localStorage.getItem('chosen_owner'))
        var rendered = Mustache.render(template, {pet_name : chosen_pet.Name,owner_first_name : chosen_owner.FirstName,owner_last_name : chosen_owner.LastName});
        alert("This is a POC for cert generator\n" + rendered);
    },

    personalDataToClass : function () {
        var chosen_pet = JSON.parse(localStorage.getItem('chosen_pet'));
        var chosen_owner = JSON.parse(localStorage.getItem('chosen_owner'));
        var chosen_dr = JSON.parse(localStorage.getItem('chosen_dr'));

        var retval = {
            pet_name : chosen_pet.Name,
            pet_breed : chosen_pet.Breed,
            pet_color : chosen_pet.Color,
            pet_chip_identifier : chosen_pet.ChipIdentifier,
            pet_type : chosen_pet.Type,
            owner_first_name : chosen_owner.FirstName,
            owner_last_name : chosen_owner.LastName,
            owner_phone : chosen_owner.PhoneNumber,
            owner_mail : chosen_owner.Mail,
            //owner_id_num : chosen_owner.IdNum
            dr_first_name : chosen_dr.FirstName,
            dr_first_name : chosen_dr.FirstName,
            dr_first_name : chosen_dr.FirstName,
            dr_first_name : chosen_dr.FirstName,

        }
        return retval;
    }
}

var certificateImporter = {
    castration : {
        title : "אישור וטרינרי לעיקור כלבים",
        body: "I need cert for {{pet_name}} and the owner name is {{owner_first_name}} {{owner_last_name}}"
    }
}