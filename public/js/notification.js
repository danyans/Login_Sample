var iN = new iNotify({
    effect: 'flash', //scroll
    interval: 500,
    message:"New Message!",
    audio:{
        // file: ['s/msg.mp4','message_tone.mp3','s/msg.wav']
        file: ['message_tone.mp3']
    },
    notification:{
        title:"Notification!",
        body:'You have a new message.'
    }
});


function inotifyTest(){

    // var parm = getParameterByName('flag');
    var parm = $.urlParam('flag');
    if(parm=='true'){
        iN.setFavicon(10).setTitle('Information').notify({
            title:"Notification",
            body:"You application has been submitted successfully!"
        }).player()
    }  

    // iN.setFavicon(10).setTitle('Information').notify({
    //     title:"Notification",
    //     body:"You application has been submitted successfully!"
    // }).player()
}

$.urlParam= function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    console.log(results);
    if (!results) return null;
    if (!results[1]) return '';
	return results[1] || 0;
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
        console.log(results);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

