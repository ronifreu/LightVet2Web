var serverAddress = 'http://localhost:9000'

$(document).ready(function() {
    ownerInfo.init();
    petsInfo.init();
    addPet.init();
});

var ownerInfo = {
    init :     function(){
        $.ajax(serverAddress+'/api/Owner/GetOwnersByIdentifiers',{
            data: {"identifiersList[0]": localStorage.getItem('owner_id')},
            success: function (response) {
                ownerInfo.showOwner(response[0]);
                localStorage.setItem('chosen_owner',JSON.stringify(response[0]));
            },
            error: function(request, errorType, errorMessage) {
                console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                alert(request.responseText);
            }
        })
    },

    showOwner: function (owner) {
        $('#owner_details').html("Name: " + owner.FirstName + " " + owner.LastName+"<br>Phone Number: " + owner.PhoneNumber+"<br>Address: "+ owner.Address+" "+owner.City+ "<br>ID: "+ owner.IdNumber+"<br><br><br><br><br>");
    }
}

var petsInfo = {
    init :     function(){
        $.ajax(serverAddress+'/api/Pet/GetPetsByOwnerIdentifier',{
            data: {"ownerIdentifier": localStorage.getItem('owner_id')},
            success: function (response) {
                petsInfo.showPets(response);
            },
            error: function(request, errorType, errorMessage) {
                console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                alert(request.responseText)
            }
        })
    },

    showPets: function (petsList) {
        console.log("showSearchRes call");
        var rendered = "";
        var template = '<article class={{style_class}}>'+
            '  <span class="image">'+
            ' <img src={{image_src}} alt="" />'+
            '</span>'+
            '<a href="petPage.html" data-pet_identifier="{{identifier}}" class="pet_link">'+
            '<h2>{{name}}</h2>'+
            '<h3></h3>'+
            '<div class="content">'+
            '<p>{{chipNum}}</p>'+
            '</div>'+
            '</a>'+
            '</article>';


        petsList.forEach(function(el){
            console.log("Build HTML call");
            rendered = rendered + Mustache.render(template, {identifier : el.Identifier,name : el.Name,chipNum : el.ChipIdentifier, style_class : "style"+(Math.floor(Math.random() * 6) + 1), image_src : el.Type == 1 ? "images/dogSample.jpg":"images/catSample.jpg"});
        });
        $('#pets_list_block').html(rendered);
        $(".pet_link").on('click',function () {
            console.log($(this).data("pet_identifier"));
            localStorage.setItem('pet_id',$(this).data("pet_identifier"));
        })
    }
}

var addPet = {
    init: function () {
        this.initFormValidation();
        $('#add_pet_form').on('submit', this.sendAddPetForm);
        $('#pet-type').on('change',this.petSelect);
    },
    sendAddPetForm: function (event) {
        if($('#chipNumGenerator').is(':checked')){
            $('#chipNum').val("nc" + Date.now());
        }
        event.preventDefault();
        if($(this).valid()){
            $.ajax(serverAddress+'/api/Pet/AddPet',{
                type: 'POST',
                data: {"OwnerIdentifier":  localStorage.getItem('owner_id'),
                    "Name":  $('#name').val(),
                    "Breed":  $('#breed').val(),
                    "Color":  $('#color').val(),
                    "ChipIdentifier":  $('#chipNum').val(),
                    "Type":  $('#pet-type').val(),
                    "Age":  $('#pet-age').val(),
                    "Gender":  $('#pet-gender').val()},
                success: function (response) {
                    petsInfo.init();
                    $('#add_pet_form').get(0).reset();
                    alert("Pet  added");
                },
                error: function(request, errorType, errorMessage) {
                    console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                    alert(request.responseText);
                }
            })
        }
    },
    petSelect: function (event) {
        if($(this).val() == 1) {
            $('#chipNum').parent('div').removeClass('hide_chip_field');
            $('#chipNumGenerator').parent('div').removeClass('hide_chip_field');
        }
        else {
            $('#chipNum').parent('div').addClass('hide_chip_field');
            $('#chipNumGenerator').parent('div').addClass('hide_chip_field');
            $('#chipNum').val("nc" + Date.now());
            //console.log($('#chipNum').val());
        }
    },

    initFormValidation : function () {

        $('#add_pet_form').validate({
            rules: {
                name: {
                    required : true,
                    rangelength: [2, 50]
                },
                breed:{
                    required : true,
                    rangelength: [2, 50]
                },
                color: {
                    required : true,
                    rangelength: [2, 50]
                },
                idNumber:{
                    required : true,
                    rangelength: [9, 9]
                },
                chipNum: {
                    rangelength: [10, 15]
                }
            }
        });
    }
}


