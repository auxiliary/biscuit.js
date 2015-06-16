requirejs.config({
    "shim": {
        "jquery-cookie" : ["jquery"],
        "messaging"     : ["jquery"]
    }
})
requirejs(['jquery', 'jquery.cookie', 'messaging'], function(jQuery, jquery_cookie){
    jQuery(".messages").messaging({
        'messages' :[
            {'text'  : 'This is a test', 'level' : 'info'},
            {'text'  : 'Some notification', 'level' : 'error', 'hide': true},
            {'text'  : 'Something else', 'level' : 'success'},
        ]
    });
    jQuery(".messages").messaging("display");
    //jQuery(".messages").messaging("remove_all");
});
