

$(document).ready(function() {
    ////// load page behaviors actions
    //Test with 'Get Owners Button
    $('#owners_list').on('click', 'button', function() {
        $.ajax('http://localhost:51714/api/Owner',{
            success: function (response) {
                $('.owners').text(JSON.stringify(response));
            }
        });
    });
    //Dynamic search

    search.init();
});

var search =  {
    // init: function () {
    //
    // }
    init: function () {
        $('#search_field').on('keyup', this.queryServer)
    },
    queryServer: function () {
        console.log("queryServer call");
        $.ajax('http://localhost:51714/api/Owner',{
            success: search.showSearchRes,
            data: {"Phone": $('#cb_phone_number').is(':checked') ? $('#search_field').val() : "",
                "FirstName": $('#cb_first_name').is(':checked') ? $('#search_field').val() : "",
                "LastName": $('#cb_last_name').is(':checked') ? $('#search_field').val() : "",
                "Chip": $('#cb_chip').is(':checked') ? $('#search_field').val() : ""}
        })
    },
    showSearchRes : function (response) {
        console.log("showSearchRes call");
        var rendered = "";
        var template = '<article class={{style_class}}>'+
            '  <span class="image">'+
            ' <img src={{image_src}} alt="" />'+
            '</span>'+
            '<a href="generic.html">'+
            '<h2>{{lastName}} {{firstName}}</h2>'+
            '<h3>{{phoneNum}}</h3>'+
            '<div class="content">'+
            '<p>{{petsNames}}</p>'+
            '</div>'+
            '</a>'+
            '</article>';

        console.log(response);
        response.forEach(function(el){
            console.log("Build HTML call");
            rendered = rendered + Mustache.render(template, {phoneNum : el.PhoneNumber,firstName : el.FirstName,lastName : el.LastName,mail : el.Mail, petsNames : "Blacky", style_class : "style"+(Math.floor(Math.random() * 6) + 1), image_src : "images/dogSample.jpg"});
        });
        $('#owners_search_res_block').html(rendered);

    }
}

function myFunction(){
    console.log("Create User Call")
    $.ajax('http://localhost:51714/api/Owner',{
        success: search.showSearchRes,
        data: {"Phone": "aa@a.a",
            "FirstName": "aa@a.a",
            "LastName": "aa@a.a",
            "Mail": "aa@a.a"}
    });
}