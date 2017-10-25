var serverAddress = 'http://localhost:9000';
var appointmentsTemplatesList = [];
var chosenMedicineDict = {}
var medicineResposneDict = {}
var chosenPrescriptionDict = {}
var PrescriptionResposneDict = {}
var RecommendationResposneDict = {}
var chosenRecommendationDict = {}
var DiagnosisResposneDict = {}
var chosenDiagnosisDict = {}
var importantProceduresTemplatesDict = {}
var importantProceduresDict = {}
var chosenImportantProceduresDict = {}

$(document).ready(function() {
    petInfo.init();
    appointmentInfo.init();
    addAppointment.init();
    certificatesGenerator.init();
    templateDropDown.init();
    searchMedicine.init();
    searchPrescription.init();
    searchRecommendation.init();
    searchDiagnosis.init();
    importantProcedureInfo.init();
    document.getElementById("appointmentDate").valueAsDate  = new Date();

    $(document).ready(function() {
        $(window).keydown(function(event){
            if(event.keyCode == 13) {
                event.preventDefault();
                console.log(event.target.id)
                if(event.target.id == "medicine_name_search"){
                    location.href = '#add_medicine_pop';
                    $('#new-medicine-name').html($('#medicine_name_search').val());
                }
                if(event.target.id == "prescription_search"){
                    location.href = '#add_prescription_pop';
                    $('#new-prescription-name').html($('#prescription_search').val());
                }
                if(event.target.id == "recommendation_search"){
                    location.href = '#add_recommendation_pop';
                    $('#new-recommendation-name').html($('#recommendation_search').val());
                }
                if(event.target.id == "diagnosis_search"){
                    location.href = '#add_diagnosis_pop';
                    $('#new-diagnosis-name').html($('#diagnosis_search').val());
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
    }


}

var importantProcedureInfo = {
    init : function(){
        $.ajax(serverAddress+'/api/Appointment/GetImportantProcedureTemplatesForPetId',{
            data: {"petIdentifier": localStorage.getItem('pet_id')},
            success: function (response) {
                $.ajax(serverAddress+'/api/Appointment/GetImportantProceduresForPetId',{
                    data: {"petIdentifier": localStorage.getItem('pet_id')},
                    success: function (response) {
                        importantProcedureInfo.saveImportantProcedures(response);
                        importantProcedureInfo.showImportantProcedures();
                    },
                    error: function(request, errorType, errorMessage) {
                        console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                        alert(request.responseText)
                    }
                })
                importantProcedureInfo.saveImportantProcedureTemplates(response);
            },
            error: function(request, errorType, errorMessage) {
                console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                alert(request.responseText)
            }
        })
    },
    applyProcedure: function () {
        var uuid = "guid" + new Date().getTime();
        chosenImportantProceduresDict[$('#important_procedure_name').val()] = {
            Identifier : uuid,
            Name : $('#important_procedure_name').val(),
            MedicalIdentifierType : 0,
            MedicalIdentifier : $('#new-medicine-unit').val(),
            ImportantProcedureType : 0,
            "ActualDate" : $('#appointmentDate').val()
        }
        importantProceduresDict[$('#important_procedure_name').val()] = {
            Name : $('#important_procedure_name').val()
        }
        importantProcedureInfo.showImportantProcedures();
        location.href = '#';
        alert("Procedure "+ $('#important_procedure_name').val() +" successfully registrated for this appointment");
    },
    saveImportantProcedureTemplates: function (appointments) {
        appointments.forEach(function(el){
            importantProceduresTemplatesDict[el.Name]=el;
        });
    },
    saveImportantProcedures: function (appointments) {
        appointments.forEach(function(el){
            importantProceduresDict[el.Name]=el;
        });
    },
    showImportantProcedures : function () {
        console.log("showImportantProcedures call");
        console.log(importantProceduresDict);
        var rendered = "";
        var template = '<div class="important_procedure_item {{classType}}">{{Name}}</div>';
        for (var key in importantProceduresTemplatesDict){
            class_type = key in importantProceduresDict ? "good" : "bad";
            class_type = key in chosenImportantProceduresDict ? "edited" : class_type;
            rendered = rendered + Mustache.render(template, {Name : importantProceduresTemplatesDict[key].Name,classType : class_type});
        }

        $('#important_procedures_block').html(rendered);
        this.importantProcedureItemBehavior();
    },

    importantProcedureItemBehavior : function () {
        $('.important_procedure_item').on('click', function () {
            location.href = '#apply_important_procedure_pop';
            $('#important_procedure_name').val($(this).html());
        })
    }
}

var addAppointment = {
    init: function () {
        this.initFormValidation();
        $('#add_appointment_form').on('submit', this.sendAddAppointmentForm);
    },
    sendAddAppointmentForm: function (event) {
        event.preventDefault();
        var chosenMedicinesList = $.merge(Object.keys(chosenMedicineDict).map(function(key){
            return chosenMedicineDict[key];
        }),Object.keys(chosenPrescriptionDict).map(function(key){
            return chosenPrescriptionDict[key];
        }));

        chosenMedicinesList = $.merge(Object.keys(chosenRecommendationDict).map(function(key){
            return chosenRecommendationDict[key];
        }),chosenMedicinesList);

        var chosenDiagnosisList = Object.keys(chosenDiagnosisDict).map(function(key){
            return chosenDiagnosisDict[key];
        });

        var chosenImportantProceduresList = Object.keys(chosenImportantProceduresDict).map(function(key){
            return chosenImportantProceduresDict[key];
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
                    "DiagnosisAsJson" : JSON.stringify(chosenDiagnosisList),
                    "ImportantProceduresAsJson" : JSON.stringify(chosenImportantProceduresList),
                    "IsHeartLungsGood" : $('#heart-lungs').is(':checked'),
                    "IsBodyTempratureGood" : $('#body-temp').is(':checked'),
                    "IsEarsGood" : $('#ears').is(':checked'),
                    "IsMouthGood" : $('#mouth').is(':checked'),
                    "IsEyesGood" : $('#eyes').is(':checked'),
                    "ActualDate" : $('#appointmentDate').val()
                },
                success: function (response) {
                    appointmentInfo.init();
                    $('#add_appointment_form').get(0).reset();
                    document.getElementById("appointmentDate").valueAsDate  = new Date();
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
    addMedicine: function () {
        var uuid = "guid" + new Date().getTime();
        chosenMedicineDict[uuid] = {
            Identifier : uuid,
            Name : $('#medicine_name_search').val(),
            Dosage : $('#new-medicine-dosage').val(),
            MesurmentUnit : $('#new-medicine-unit').val(),
            TreatmentEntryType : 1
        }
        searchMedicine.showSearchRes();
        location.href = '#add_appointment_form';
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

        if(response) {
            response.forEach(function (el) {
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
        }
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
    addPrescription: function () {
        var uuid = "guid" + new Date().getTime();
        chosenPrescriptionDict[uuid] = {
            Identifier : uuid,
            Name : $('#prescription_search').val(),
            Dosage : $('#new-prescription-dosage').val(),
            MesurmentUnit : $('#new-prescription-unit').val(),
            DailyFrequency : $('#new-prescription-frequency').val(),
            TreatmentEntryType : 2
        }
        searchPrescription.showSearchRes();
        location.href = '#add_appointment_form';
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

        if(response) {
            response.forEach(function (el) {
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
        }
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
    addRecommendation: function () {
        var uuid = "guid" + new Date().getTime();
        chosenRecommendationDict[uuid] = {
            Identifier : uuid,
            Name : $('#recommendation_search').val(),
            DailyFrequency : $('#new-recommendation-frequency').val(),
            TreatmentEntryType : 3
        }
        searchRecommendation.showSearchRes();
        location.href = '#add_appointment_form';
    },
    showSearchRes : function (response) {
        console.log("searchRecommendation showSearchRes call");
        var rendered = "";
        var template = '<li><a href="#" class="button {{classType}} small recommendation_template_button" data-medicine_template_identifier="{{identifier}}">{{medicineName}}</a></li>';
        console.log(chosenRecommendationDict)
        for (var key in chosenRecommendationDict){
            rendered = rendered + Mustache.render(template, {classType : "special",medicineName : chosenRecommendationDict[key].Name,dosage : chosenRecommendationDict[key].Dosage,mesurmentUnit : enumConverter.mesurmentUnit.fromNumToStr(chosenRecommendationDict[key].MesurmentUnit),identifier : key});
        }

        if(response) {
            response.forEach(function (el) {
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
        }
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

var searchDiagnosis =  {
    init: function () {
        $('#diagnosis_search').on('keyup', this.queryServer);
        this.queryServer();
    },

    queryServer: function () {
        console.log("searchDiagnosis queryServer call");
        $.ajax(serverAddress+'/api/Appointment/GetDiagnosisTemplateByStartWithName',{
            data: {"diagnosisName": $('#diagnosis_search').val()},

            success: function (response) {
                DiagnosisResposneDict = {}
                response.forEach(function(el){
                    DiagnosisResposneDict[el.Identifier] = el
                });
                searchDiagnosis.showSearchRes(response)
            },
            error: function(request, errorType, errorMessage) {
                console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                alert(request.responseText)
            }
        })
    },
    addDiagnosis: function () {
        var uuid = "guid" + new Date().getTime();
        chosenDiagnosisDict[uuid] = {
            Identifier : uuid,
            Name : $('#diagnosis_search').val(),
            Severity : $('#new-diagnosis-severity').val(),
        }
        searchDiagnosis.showSearchRes();
        location.href = '#add_appointment_form';
    },
    showSearchRes : function (response) {
        console.log("searchDiagnosis showSearchRes call");
        var rendered = "";
        var template = '<li><a href="#" class="button {{classType}} small diagnosis_template_button" data-medicine_template_identifier="{{identifier}}">{{diagnosisName}}</a></li>';
        console.log(chosenDiagnosisDict)
        for (var key in chosenDiagnosisDict){
            rendered = rendered + Mustache.render(template, {classType : "special",diagnosisName : chosenDiagnosisDict[key].Name,identifier : key});
        }

        if(response) {
            response.forEach(function (el) {
                if (!(el.Identifier in chosenDiagnosisDict)) {
                    rendered = rendered + Mustache.render(template, {
                            classType: "",
                            diagnosisName: el.Name,
                            identifier: el.Identifier
                        });
                }
            });
        }
        $('#diagnosis_template_list_search_block').html(rendered);
        $(".diagnosis_template_button").on('click',function (event) {
            event.preventDefault();

            $(this).toggleClass("special");
            if($(this).data("medicine_template_identifier") in chosenDiagnosisDict) {
                delete chosenDiagnosisDict[$(this).data("medicine_template_identifier")]
            }
            else {
                var selectedId = $(this).data("medicine_template_identifier")
                chosenDiagnosisDict[selectedId] = DiagnosisResposneDict[selectedId];
            }
        })
    }
}