function dets() {
		window.alert("function called");
	    $.ajax({
					type : "GET",
					url : "http://api.humandroid.us/api/getalldevices",
						
					xhrFields:{withCredentials:true},
					success : function(data){
							$('#dplay').empty();
								for(var i in data.data){
								  
								  var dname = data.data[i].DeviceName;	
								  var plid = data.data[i].PlantID;
								  $('#dplay').append('<h2>' + dname + ':</h2>');
								  var tid = "<h3><table id = " + plid + "></table></h3>";
								  var ref = "#" + plid;
								  $('#dplay').append(tid);
								  
								  
								  //$('#table_heading').text(dname);
								  var purl = "http://api.humandroid.us/api/getlatestplantupdate/" + plid;
								 
								  $.ajax({
											type : "GET",
											url : purl,
											xhrFields:{withCredentials:true},
											success: function(pdata){
											   
												var ind = $('<tr/>');
												ind.append('<th>PlantName</th> <th>Temp</th>	<th>PH</th> <th>PPM</th> <th>Moist</th>');
												$(ref).append(ind);
											   for(var j in pdata.data){
																var tr = $('<tr/>');
																var pname = "tomato";
																var temp = pdata.data[j].condition.temp;
																var ph = pdata.data[j].condition.ph;
																var ppm = pdata.data[j].condition.nutrient;
																var moist = pdata.data[j].condition.moisture;
																tr.append('<td>' + pname + '</td>' +'<td>' + temp + '</td>' + '<td>' + ph + '</td>' + '<td>' + ppm + '</td>' + '<td>' + moist + '</td>');
																
																$(ref).append(tr);
											   
											   }
											
											},
								   async: false
								  });
								  
								  
								}
								
								}
		
		
		});
        
    }