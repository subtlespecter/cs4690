$(function(){
	var iosocket = io.connect();
	iosocket.on('connect', function () {
	    $('#chatText').val('===Connected===');
	    
	    iosocket.on('message', function(message) {
	    	var currentText = $('#chatText').val();
	        $('#chatText').val(currentText + '\n' + message);
	    });
	    
	    iosocket.on('disconnect', function() {
	    	var currentText = $('#chatText').val();
	        $('#chatText').val(currentText + '\n' + '===Disconnected===');
	    });
	});
	$('#chatInput').keypress(function(event) {
	    if(event.which == 13) {
	        event.preventDefault();
	        iosocket.send($('#chatInput').val());
	        var currentText = $('#chatText').val();
	        var newMessage = $('#chatInput').val();
	        $('#chatText').val(currentText + '\n' + newMessage);
	        $('#chatInput').val('');
	    }
	});
});