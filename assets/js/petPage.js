var serverAddress = 'http://localhost:51714'

$(document).ready(function() {
    console.log(localStorage.getItem('pet_id'));
    petInfo.init();
});

var petInfo = {
    init :     function(){
        $.ajax(serverAddress+'/api/Pet/GetPetsByIdentifiers',{
            data: {"identifiersList[0]": localStorage.getItem('pet_id')},
            success: function (response) {
                console.log(response);
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
        $('#pet_details').html(pet.Name + " " + pet.Color + " " + pet.ChipIdentifier);
    }
}



