var serverAddress = 'http://localhost:51714'

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
            },
            error: function(request, errorType, errorMessage) {
                console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                alert(request.responseText)
            }
        })
    },

    showOwner: function (owner) {
        $('#owner_details').html(owner.FirstName + " " + owner.LastName + " " + owner.PhoneNumber);
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
            rendered = rendered + Mustache.render(template, {identifier : el.Identifier,name : el.Name,chipNum : el.ChipIdentifier, style_class : "style"+(Math.floor(Math.random() * 6) + 1), image_src : "images/dogSample.jpg"});
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
        $('#add_pet_form').on('submit', this.sendAddPetForm)
    },
    sendAddPetForm: function (event) {
        event.preventDefault();
        $.ajax(serverAddress+'/api/Pet/AddPet',{
            type: 'POST',
            data: {"OwnerIdentifier":  localStorage.getItem('owner_id'),
                "Name":  $('#name').val(),
                "Breed":  $('#breed').val(),
                "Color":  $('#color').val(),
                "ChipIdentifier":  $('#chipIdentifier').val(),
            "Type":  "1"},
            success: function (response) {
                alert("Pet  added");
                petsInfo.init();
            },
            error: function(request, errorType, errorMessage) {
                console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                alert(request.responseText);
            }
        })

    }
}


