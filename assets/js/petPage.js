var serverAddress = 'http://localhost:9000';
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
                alert(request.responseText);
            }
        })
    },

    showPet: function (pet) {
        $('#pet_details').html("Name: " + pet.Name + "<br>Color: " + pet.Color + "<br>Breed:  " + pet.Breed+ "<br>Chip Number:  " + pet.ChipIdentifier+ "<br>BirthDate:  " +stringFormater.dateStringToNiceString(pet.DateOfBirth) +" (Age: "+stringFormater.dateStringToNiceAge(pet.DateOfBirth)+")<br>Castrated: "+pet.IsCastrated);
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
            '<td class="">{{appointmentType}}</td>'+
            '<td class="textDir textDirRtl">{{appointmentTitle}}</td>'+
            '<td class="textDir textDirRtl">{{timeCreated}}</td>'+
            '</tr>'+
            '<tr style="display: none" class="textDir textDirRtl"><td colspan="3">{{appointmentSummery}}</td></tr>';


        appointments.forEach(function(el){
            rendered = rendered + Mustache.render(template, {identifier : el.Identifier,appointmentTitle : el.AppointmentTitle,appointmentSummery : el.AppointmentSummery,timeCreated : stringFormater.dateStringToNiceStringWithTime(el.TimeCreated),appointmentType : enumConverter.appointmentType.fromNumToStr(el.Type)});
        });
        $('#appointments_list_block').html(rendered);
        this.appointmentListBehavior();
    },

    appointmentListBehavior : function () {
        $('.appointment_row').on('click', function () {
            $(this).next().slideToggle(10);
        })
    },


}

var addAppointment = {
    init: function () {
        this.initFormValidation();
        $('#add_appointment_form').on('submit', this.sendAddAppointmentForm);
    },
    sendAddAppointmentForm: function (event) {
        event.preventDefault();
        console.log($('input[name="appointmentType"]:checked').data('val'));
        if($(this).valid()) {
            $.ajax(serverAddress + '/api/Appointment/AddAppointment', {
                type: 'POST',
                data: {
                    "OwnerIdentifier": localStorage.getItem('owner_id'),
                    "PetIdentifier": localStorage.getItem('pet_id'),
                    "AppointmentTitle": $('#appointmentTitle').val(),
                    "Identifier": "",
                    "TimeCreated": "",
                    "TimeModified": "",
                    "AppointmentSummery": $('#appointmentSummery').val(),
                    "Type": $('input[name="appointmentType"]:checked').data('val')
                },
                success: function (response) {
                    appointmentInfo.init();
                    $('#add_appointment_form').get(0).reset();
                    alert("Appointment  added");
                },
                error: function (request, errorType, errorMessage) {
                    console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" + request.responseText);
                    alert(request.responseText);
                }
            })
        }
    },
    initFormValidation : function () {

        $('#add_appointment_form').validate({
            rules: {
                appointmentTitle: {
                    required : true,
                },
                appointmentSummery:{
                    required : true,
                }
            }
        });
    }

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
             var sum = $('#appointmentSummery');
             var title = $('#appointmentTitle')
             sum.val(chosen_template.AppointmentSummery);
             title.val(chosen_template.AppointmentTitle);
             sum.trigger('keyup');
             title.trigger('keyup');
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
        $('.certificate-item').on('click',this.generateCertificate(this.certificatesNamesList[0]));
    },
    certificatesNamesList : ["castration","flight"],

    generateCertificate: function (chosen_cetificate) {
        return function () {
            chosen_cetificate = $(this).data("cert_type");
            $.ajax('assets/certificates/'+chosen_cetificate+'.html',{
                success: function (response) {
                    var certificateElement = $('#divon');
                    var personalData = certificatesGenerator.personalDataToClass();
                    personalData.time = stringFormater.dateStringToNiceString(Date.now());
                    var rendered = Mustache.render(response.toString(), personalData);
                    certificateElement.removeClass("hide-all");
                    certificateElement.html(rendered);
                    var doc = new jsPDF();
                    doc.addHTML(certificateElement,function () {
                        doc.save(personalData.pet_chip_identifier+'_'+chosen_cetificate+'.pdf');
                        //certificateElement.html("");
                        certificateElement.addClass("hide-all");
                    });
                },
                error: function(request, errorType, errorMessage) {
                    console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                    alert(request.responseText)
                }
            })
        };
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
            pet_birthdate : chosen_pet.DateOfBirth,
            owner_first_name : chosen_owner.FirstName,
            owner_last_name : chosen_owner.LastName,
            owner_phone : chosen_owner.PhoneNumber,
            owner_mail : chosen_owner.Mail,
            owner_id_num : chosen_owner.IdNumber,
            owner_city : chosen_owner.City,
            owner_address : chosen_owner.Address,
            dr_first_name : chosen_dr.FirstName,
            dr_last_name : chosen_dr.LastName,
            dr_license_num : chosen_dr.LicenseNum,
            dr_phone : chosen_dr.PhoneNumber,
            dr_address : chosen_dr.Address
        }
        return retval;
    }
}