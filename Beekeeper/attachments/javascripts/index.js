//The javascript for the index page.
$(function(){ 
	$('.farmLink').click(function(){
		$('#detail').empty();   
		var beeId = $(this).data('beeid');
		var requestUrl = createRequestUrl(beeId);
		var item = $('#detail');
		addSpinner(item);
		$.getJSON(requestUrl,function(data){
			removeSpinner();
			addSensor(item,data);
		});
	});
});

function createRequestUrl(beeId){   
    return '/sensors/'+beeId;       
}

function addSpinner(item){
    var spinnerString = '<i class="icon-spinner icon-spin icon-large"></i>';
    item.html(spinnerString);
}

function removeSpinner(){ 
    $('.icon-spinner').hide();
}

function addSensor(item,data){
    item.html(createSensorString(data));
}

function createSensorString(data){
    if(data.length === 0){return '<span class="alert alert-error">No sensors found for this map</span><hr/>';}
    var date = data[0].time;    
    var dateString = '<div class="muted">'+date+'</div>';
    var partial = buildSensorPartial(data);
    return dateString+partial;
}

function buildSensorPartial(data){
    var sensorPartial = '';
    for(i=0;i<data.length;i++){
        var item = data[i];
        sensorPartial+='<li><span class="lead"><a href="/readings/'+item.id+'">'+item.sensorString+'</a>:'+item.value+item.units+'</span></li>';
        
}
return '<ul class="unstyled">'+sensorPartial+'</ul><hr/>';
}
