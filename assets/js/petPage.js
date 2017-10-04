var serverAddress = 'http://localhost:9000';
var appointmentsTemplatesList = [];
var chosenMedicineDict = {}
var medicineResposneDict = {}
var chosenPrescriptionDict = {}
var PrescriptionResposneDict = {}
var RecommendationResposneDict = {}
var chosenRecommendationDict = {}

$(document).ready(function() {
    petInfo.init();
    appointmentInfo.init();
    addAppointment.init();
    certificatesGenerator.init();
    templateDropDown.init();
    searchMedicine.init();
    searchPrescription.init();
    searchRecommendation.init();


    $(document).ready(function() {
        $(window).keydown(function(event){
            if(event.keyCode == 13) {
                event.preventDefault();
                console.log(event.target.id)
                if(event.target.id == "medicine_name_search"){
                    $( "#medicine_name_search" ).trigger("target");
                    console.log("open add medicine modal")
                }
                return false;
            }
        });
    });
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
        var chosenMedicinesList = Object.keys(chosenMedicineDict).map(function(key){
            return chosenMedicineDict[key];
        });
        var chosenPrescriptionList = Object.keys(chosenPrescriptionDict).map(function(key){
            return chosenPrescriptionDict[key];
        });

        if($(this).valid()) {
            $.ajax(serverAddress + '/api/Appointment/AddAppointment', {
                type: 'POST',
                data: {
                    "OwnerIdentifier": localStorage.getItem('owner_id'),
                    "PetIdentifier": localStorage.getItem('pet_id'),
                    "AppointmentTitle": $('#appointmentTitle').val(),
                    "AppointmentSummery": $('#appointmentSummery').val(),
                    "Type": $('input[name="appointmentType"]:checked').data('val'),
                    "MedicinesAsJson" : JSON.stringify(chosenMedicinesList),
                    "AfterTreatmentsAsJson" : JSON.stringify(chosenPrescriptionList),
                    "IsHeartLungsGood" : $('#heart-lungs').is(':checked'),
                    "IsBodyTempratureGood" : $('#body-temp').is(':checked'),
                    "IsEarsGood" : $('#ears').is(':checked'),
                    "IsMouthGood" : $('#mouth').is(':checked'),
                    "IsEyesGood" : $('#eyes').is(':checked')
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

var searchMedicine =  {
    init: function () {
        $('#medicine_name_search').on('keyup', this.queryServer);
        this.queryServer();
    },
    queryServer: function () {
        console.log("searchMedicine queryServer call");
        $.ajax(serverAddress+'/api/Appointment/GetMedicineTemplateByStartWithName',{
            data: {"medicineName": $('#medicine_name_search').val(),
                    "TreatmentEntryType" : 1},

            success: function (response) {
                medicineResposneDict = {}
                response.forEach(function(el){
                    medicineResposneDict[el.Identifier] = el
                });
                searchMedicine.showSearchRes(response)
            },
            error: function(request, errorType, errorMessage) {
                console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                alert(request.responseText)
            }
        })
    },
    showSearchRes : function (response) {
        console.log("searchMedicine showSearchRes call");
        var rendered = "";
        var template = '<li><a href="#" class="button {{classType}} small medicine_template_button" data-medicine_template_identifier="{{identifier}}">{{medicineName}} {{dosage}} {{mesurmentUnit}}</a></li>';
        console.log(chosenMedicineDict)
        for (var key in chosenMedicineDict){
            rendered = rendered + Mustache.render(template, {classType : "special",medicineName : chosenMedicineDict[key].Name,dosage : chosenMedicineDict[key].Dosage,mesurmentUnit : enumConverter.mesurmentUnit.fromNumToStr(chosenMedicineDict[key].MesurmentUnit),identifier : key});
        }


        response.forEach(function(el){
            if (!(el.Identifier in chosenMedicineDict)) {
                rendered = rendered + Mustache.render(template, {
                        classType: "",
                        medicineName: el.Name,
                        dosage: el.Dosage,
                        mesurmentUnit: enumConverter.mesurmentUnit.fromNumToStr(el.MesurmentUnit),
                        identifier: el.Identifier
                    });
            }
        });
        $('#medicine_template_list_chosen_block').html(rendered);
        $(".medicine_template_button").on('click',function (event) {
            event.preventDefault();

            $(this).toggleClass("special");
            if($(this).data("medicine_template_identifier") in chosenMedicineDict) {
                delete chosenMedicineDict[$(this).data("medicine_template_identifier")]
            }
            else {
                var selectedId = $(this).data("medicine_template_identifier")
                chosenMedicineDict[selectedId] = medicineResposneDict[selectedId];
            }
        })
    }
}

var searchPrescription =  {
    init: function () {
        $('#prescription_search').on('keyup', this.queryServer);
        this.queryServer();
    },
    queryServer: function () {
        console.log("searchPrescription queryServer call");
        $.ajax(serverAddress+'/api/Appointment/GetMedicineTemplateByStartWithName',{
            data: {"medicineName": $('#prescription_search').val(),
                "TreatmentEntryType" : 2},

            success: function (response) {
                PrescriptionResposneDict = {}
                response.forEach(function(el){
                    PrescriptionResposneDict[el.Identifier] = el
                });
                searchPrescription.showSearchRes(response)
            },
            error: function(request, errorType, errorMessage) {
                console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                alert(request.responseText)
            }
        })
    },
    showSearchRes : function (response) {
        console.log("searchPrescription showSearchRes call");
        var rendered = "";
        var template = '<li><a href="#" class="button {{classType}} small prescription_template_button" data-medicine_template_identifier="{{identifier}}">{{medicineName}} {{dosage}} {{mesurmentUnit}}</a></li>';
        console.log(chosenPrescriptionDict)
        for (var key in chosenPrescriptionDict){
            rendered = rendered + Mustache.render(template, {classType : "special",medicineName : chosenPrescriptionDict[key].Name,dosage : chosenPrescriptionDict[key].Dosage,mesurmentUnit : enumConverter.mesurmentUnit.fromNumToStr(chosenPrescriptionDict[key].MesurmentUnit),identifier : key});
        }


        response.forEach(function(el){
            if (!(el.Identifier in chosenPrescriptionDict)) {
                rendered = rendered + Mustache.render(template, {
                        classType: "",
                        medicineName: el.Name,
                        dosage: el.Dosage,
                        mesurmentUnit: enumConverter.mesurmentUnit.fromNumToStr(el.MesurmentUnit),
                        identifier: el.Identifier
                    });
            }
        });
        $('#prescription_template_list_chosen_block').html(rendered);
        $(".prescription_template_button").on('click',function (event) {
            event.preventDefault();

            $(this).toggleClass("special");
            if($(this).data("medicine_template_identifier") in chosenPrescriptionDict) {
                delete chosenPrescriptionDict[$(this).data("medicine_template_identifier")]
            }
            else {
                var selectedId = $(this).data("medicine_template_identifier")
                chosenPrescriptionDict[selectedId] = PrescriptionResposneDict[selectedId];
            }
        })
    }
}

var searchRecommendation =  {
    init: function () {
        $('#recommendation_search').on('keyup', this.queryServer);
        this.queryServer();
    },
    queryServer: function () {
        console.log("searchRecommendation queryServer call");
        $.ajax(serverAddress+'/api/Appointment/GetMedicineTemplateByStartWithName',{
            data: {"medicineName": $('#recommendation_search').val(),
                "TreatmentEntryType" : 3},

            success: function (response) {
                RecommendationResposneDict = {}
                response.forEach(function(el){
                    RecommendationResposneDict[el.Identifier] = el
                });
                searchRecommendation.showSearchRes(response)
            },
            error: function(request, errorType, errorMessage) {
                console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                alert(request.responseText)
            }
        })
    },
    showSearchRes : function (response) {
        console.log("searchRecommendation showSearchRes call");
        var rendered = "";
        var template = '<li><a href="#" class="button {{classType}} small recommendation_template_button" data-medicine_template_identifier="{{identifier}}">{{medicineName}}</a></li>';
        console.log(chosenRecommendationDict)
        for (var key in chosenRecommendationDict){
            rendered = rendered + Mustache.render(template, {classType : "special",medicineName : chosenRecommendationDict[key].Name,dosage : chosenRecommendationDict[key].Dosage,mesurmentUnit : enumConverter.mesurmentUnit.fromNumToStr(chosenRecommendationDict[key].MesurmentUnit),identifier : key});
        }


        response.forEach(function(el){
            if (!(el.Identifier in chosenRecommendationDict)) {
                rendered = rendered + Mustache.render(template, {
                        classType: "",
                        medicineName: el.Name,
                        dosage: el.Dosage,
                        mesurmentUnit: enumConverter.mesurmentUnit.fromNumToStr(el.MesurmentUnit),
                        identifier: el.Identifier
                    });
            }
        });
        $('#recommendations_list_search_block').html(rendered);
        $(".recommendation_template_button").on('click',function (event) {
            event.preventDefault();

            $(this).toggleClass("special");
            if($(this).data("medicine_template_identifier") in chosenRecommendationDict) {
                delete chosenRecommendationDict[$(this).data("medicine_template_identifier")]
            }
            else {
                var selectedId = $(this).data("medicine_template_identifier")
                chosenRecommendationDict[selectedId] = RecommendationResposneDict[selectedId];
            }
        })
    }
}