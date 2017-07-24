var serverAddress = 'http://localhost:9021'

$(document).ready(function() {
    petInfo.init();
    appointmentInfo.init();
    addAppointment.init();
    certificatesGenerator.init();
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
        console.log(pet);
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
            '<td>{{timeCreated}}</td>'+
            '<td>{{appointmentTitle}}</td>'+
            '<td>{{appointmentType}}</td>'+
            '</tr>'+
            '<tr style="display: none" dir="rtl"><td colspan="3">{{appointmentSummery}}</td></tr>';


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
        $('#appointment_template_picker').on('change', this.loadTemplate);
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

    loadTemplate: function () {
        if($(this).val() == "surgery"){
            $('#appointmentSummery').val(templatesImporter.surgery.summery);
            $('#appointmentTitle').val(templatesImporter.surgery.title);
        }
        if($(this).val() == "regular_meeting_ok"){
            $('#appointmentSummery').val(templatesImporter.regular_meeting_ok.summery);
            $('#appointmentTitle').val(templatesImporter.regular_meeting_ok.title);
        }
        if($(this).val() == "dehydration"){
            $('#appointmentSummery').val(templatesImporter.dehydration.summery);
            $('#appointmentTitle').val(templatesImporter.dehydration.title);
        }
        if($(this).val() == "no_template"){
            $('#appointmentSummery').val(templatesImporter.no_template.summery);
            $('#appointmentTitle').val(templatesImporter.no_template.title);
        }
    }
}

var templatesImporter = {
    surgery : {
        type : 2,
        title : "בוצע ניתוח",
        summery: "המלצתי ללקוח לתת לחיה הרבה מים ומעט אוכל בשבוע הקרוב"
    },
    regular_meeting_ok : {
        type : 1,
        title : "פגישה תקופתית",
        summery: "הממצאים נראו תקינים, המלצתי ללקוח לשוב אלי בעוד כחצי שנה לבדיקה תקופתית נוספת"
    },
    dehydration : {
        type : 2,
        title : "סובל מייבוש חמור",
        summery: "נתתי לחיה אינפוזיה והמלצתי לבחון מידי שעה מה מצב החיה ובמקרה של התנהגות בעייתית ליצור עימי קשר"
    },
    no_template : {
        type : 1,
        title : "",
        summery: ""
    }
}

var certificatesGenerator = {
    init: function () {
        $('#generate_certificate_button').on('click',this.generateCertificate);
    },

    generateCertificate: function () {
        var template = "I need cert for {{pet_name}} and the owner name is {{owner_first_name}} {{owner_last_name}}";
        var chosen_pet = JSON.parse(localStorage.getItem('chosen_pet'));
        var chosen_owner = JSON.parse(localStorage.getItem('chosen_owner'))
        var rendered = Mustache.render(template, {pet_name : chosen_pet.Name,owner_first_name : chosen_owner.FirstName,owner_last_name : chosen_owner.LastName});
        alert("This is a POC for cert generator\n" + rendered);
    }
}





