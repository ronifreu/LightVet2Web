var serverAddress = 'http://localhost:9000'

$(document).ready(function() {
    //Set Dr Details
    localStorage.setItem('chosen_dr','{"LicenseNum":"00777","FirstName":"דני","LastName":"פרוידנטל","Address":"שי עגנון 10 כפר סבא","PhoneNumber":"0547712231"}');
    ////// load page behaviors actions
    //Dynamic search
    search.init();
    //Creat Owner form
    createOwner.init();
});

var search =  {
    init: function () {
        $('#search_field').on('keyup', this.queryServer);
        this.queryServer();
    },
    queryServer: function () {
        console.log("queryServer call");
        $.ajax(serverAddress+'/api/Owner/GetOwnersBySearchParams',{
            data: {"Phone": $('#cb_phone_number').is(':checked') ? $('#search_field').val() : "",
                "FirstName": $('#cb_first_name').is(':checked') ? $('#search_field').val() : "",
                "LastName": $('#cb_last_name').is(':checked') ? $('#search_field').val() : "",
                "Chip": $('#cb_chip').is(':checked') ? $('#search_field').val() : ""},
            success: search.showSearchRes,
            error: function(request, errorType, errorMessage) {
                console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                alert(request.responseText)
            }
        })
    },
    showSearchRes : function (response) {
        console.log("showSearchRes call");
        var rendered = "";
        var template = '<article class={{style_class}}>'+
            '  <span class="image">'+
            ' <img src={{image_src}} alt="" />'+
            '</span>'+
            '<a href="ownerPage.html" data-owner_identifier="{{identifier}}" class="owner_link">'+
            '<h2>{{lastName}} {{firstName}}</h2>'+
            '<h3></h3>'+
            '<div class="content">'+
            '<p>{{phoneNum}}</p>'+
            '</div>'+
            '</a>'+
            '</article>';


        response.forEach(function(el){
            rendered = rendered + Mustache.render(template, {identifier : el.Identifier,phoneNum : el.PhoneNumber,firstName : el.FirstName,lastName : el.LastName,mail : el.Mail, style_class : "style"+(Math.floor(Math.random() * 6) + 1), image_src : "images/dogSample.jpg"});
        });
        $('#owners_search_res_block').html(rendered);
        $(".owner_link").on('click',function () {
            console.log($(this).data("owner_identifier"));
            localStorage.setItem('owner_id',$(this).data("owner_identifier"));
        })
    }
}

var createOwner = {
    init: function () {
        this.initFormValidation();
        $('#create_owner_form').on('submit', this.sendCreateOwnerForm)
    },
    sendCreateOwnerForm: function (event) {
        event.preventDefault();
        if($(this).valid()){
            $.ajax(serverAddress+'/api/Owner/CreateOwner',{
                type: 'POST',
                data: {"PhoneNumber":  $('#phoneNumber').val(),
                    "FirstName":  $('#firstName').val(),
                    "LastName":  $('#lastName').val(),
                    "IdNumber":  $('#idNumber').val(),
                    "Address":  $('#address').val(),
                    "Mail":  $('#email').val()},
                success: function (response) {
                    $('#create_owner_form').get(0).reset();
                    alert("Owner  added");
                    search.queryServer();
                },
                error: function(request, errorType, errorMessage) {
                    console.log('Error: ' + errorType + ' with message: ' + errorMessage + "Request:" +request.responseText);
                    alert(request.responseText);
                }
            })
        }
    },

    initFormValidation : function () {
        $.validator.addMethod(
            "regex",
            function(value, element, regexp) {
                var re = new RegExp(regexp);
                console.log(re.test(value));
                return this.optional(element) || re.test(value);
            },
            "Phone number in the formation -> 0545123123"
        );

        $('#create_owner_form').validate({
            rules: {
                email: {
                    email: true
                },
                firstName:{
                    required : true,
                    rangelength: [2, 50]
                },
                lastName: {
                    required : true,
                    rangelength: [2, 50]
                },
                phoneNumber:{
                    required : true,
                    regex: /0\d{1,2}-?\d{7}/
                },
                address:{
                    required : true,
                    rangelength: [2, 50]
                },
                idNumber:{
                    required : true,
                    rangelength: [9, 9]
                }
            }
        });
    }
}

