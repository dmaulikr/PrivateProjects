
module.exports = {

	welcomeEveryone:function (mongoose,res) {
		res.json({message: "welcome to IoT Hydrophonics API"});
	},
	insertPlant:function (mongoose,req,done) {
		console.log(" The name of the plant is : "+req.body.name);
		var Plant=require('./models/plant');
		var newPlant= Plant({
			plantName:req.body.name,
			readOnly:req.body.readOnly,
			condition       : {
				temp        : {hi:req.body.temph,low:req.body.templ},
				 ph          : {hi:req.body.phh,low:req.body.phl},
				 light       : req.body.light,
				 nutrient    : req.body.nutrient,
				 moisture    : req.body.moisture
			},
			parent:req.body.parent
		});
		newPlant.save(function(err){
			 if (err){ done(err);}
			 done(null);
		});
	},
	createChildPlant:function (body,user,done) {
		var Plant=require('./models/plant');
		var newPlant= Plant({
			userid:user.local.userID,
			plantName:body.name,
			readOnly:false,
			condition       : {

				temp        : {hi:body.temph,low:body.templ},
				ph          : {hi:body.phh,low:body.phl},
				light       : body.light,
				nutrient    : {hi:body.nutrienth,low:body.nutrientl},
				moisture    : body.moisture
			},
			parent:body.parent
		});
		newPlant.save(function(err){
			if (err){ done(err,null);}
			done(null,newPlant);
		});
	},

	getAllPlants:function (userid,done) {
		var Plant=require('./models/plant');
		var q=Plant.find({userid:{$in:['root',userid]}});

		q.exec(function (err, plants) {
			if(err) done(err,null);
			else
				done(null,plants);
		});
	},
	getRootPlants:function (res,done) {
		var Plant=require('./models/plant');
		Plant.find({readOnly:true},function(err,plants){
			if(err) done(err,null);
			done(null,plants);

		});
	},

	/*---------------------------user Methods --------------------------*/
	createUser:function (email,req,res) {
	var User= require('./models/user');
	User.findOne({'local.email':email},function(err,user){
		if(err) res.json({message:'There was an error '+err});
		user.local.Name = req.body.name;
		user.local.Phone=req.body.phone;
		user.local.DateOfBirth=req.body.date;
		user.local.securiyQuestion=req.body.sq;
		user.local.secretAnswer=req.body.sa;
		user.save(function(err){
			if(err) res.json({message:'There was an error '+err});
			res.json({message: "The user has been created successfully"});
		});
	});

	},

	getUserData:function(req,res) {
		require('./models/user').findOne({'local.email':req.user.local.email},function(err,user){
			if(err) res.json({message:'There was an error '+err});
			user.local.password="blah";
			res.json({message:"Reqested user details",data:user.getDetails()});
		});
	},

	deleteUser:function(user,res){
		console.log("delete user called");
		res.json({message:"calling deletion for the user :"+user.local});
	},

	updateToken:function(user,token,done){
		require('./models/user').findOne({'local.email':user.local.email},function(err,user){
			if(err) done(err,null);
			user.APNAToken=token;
			user.save(function(err){
				if(err) done(err,null);
				done(null,user);});

		});
	},
	updateIphoneId:function(user,iphoneid,done){
		require('./models/user').findOne({'local.email':user.local.email},function(err,user){
			if(err) done(err,null);
			user.iphoneid=iphoneid;
			user.save(function(err){
				if(err) done(err,null);
				done(null,user);});

		});
	},
	/*-----------------------requesting Device --------------------------*/

	requestDevice:function(user,res,done){
				var device=new require('./models/device')();
				device.UserID=user.local.userID;
				device.save(function(err){
					if(err) res.json({message:'There was an error '+err});
					res.json({message:"The device successfully created for the user", data:device});
				});
	},
	updateDevice:function(device,res,done){
		require('./models/device').findOne({DeviceID:device.DeviceID},function(err,dev){
			if(err) done(err);
			dev.PlantID=device.PlantID;
			dev.DeviceName=device.DeviceName;
			dev.ArduinoID=device.ArduinoID;
			dev.save(function(err){
				if(err) res.json({message:'There was an error '+err});
				res.json({message:"The device successfully updated for the user", data:device});
			});
		});
	},

	getAllDevices:function(user,res,done){
		require('./models/device').find({UserID:user.local.userID,DeviceName:{ $ne: null },PlantID:{$ne:null}},function(err,dev){
			if(err) done(err);
			 res.json({message:"requested list of devices of the user "+user.local.Name,data:dev});
		});
	},
	getPlantForArduino:function(userid,ArdId,async,done){
		function getPlantIDs(userid,arduinoID,callback){
			require('./models/device').findOne({UserID:userid,ArduinoID:arduinoID},function(err,dev){
				if(err) callback(err,null);
				else {
					callback(null,dev.PlantID);
				}
			});
		};
		function getPlant(plant,callback){
			var Plant=require('./models/plant');
			Plant.findOne({'id':plant},function(err,plants){
				if(err) callback(err,null);
				else
					callback(null,plants);
			});

		};
		async.waterfall([
			async.apply(getPlantIDs,userid,ArdId),
			getPlant

		], function (err, data) {
			if(err)
				done(err,null);
			else
				done(null,data);
		});
	},
	getDevice:function(user,deviceID,res,done){
		require('./models/device').findOne({UserID:user.local.userID,DeviceID:deviceID},function(err,dev){
			if(err) done(err);
			res.json({message:"requested device of the user "+user.local.Name,data:dev});
		});
	},

	getPlantsForUser:function(user,async,done){
		function getPlantIDs(userid,callback){
			require('./models/device').find({UserID:userid},function(err,dev){
				if(err) callback(err,null);
				else {
					var plantids = [];
					for (var device in dev){
						plantids.push(dev[device].PlantID);
					}
					callback(null,plantids);
				}
			});
		};
		function getPlants(plantids,callback){
			var Plant=require('./models/plant');
			Plant.find({'id':{$in:plantids}},function(err,plants){
				if(err) callback(err,null);
				else
				  callback(null,plants);
			});

		};
		async.waterfall([
			async.apply(getPlantIDs,user.local.userID),
			getPlants

		], function (err, data) {
			if(err)
			 done(err,null);
			else
			 done(null,data);
		});

	},

	getPlantForUser:function(user,plantid,async,done){
		function getPlantIDs(userid,plantid,callback){
			require('./models/device').findOne({UserID:userid,PlantID:plantid},function(err,dev){
				if(err) callback(err,null);
				else {
					callback(null,dev.PlantID);
				}
			});
		};
		function getPlant(plant,callback){
			var Plant=require('./models/plant');
			Plant.findOne({'id':plant},function(err,plants){
				if(err) callback(err,null);
				else
					callback(null,plants);
			});

		};
		async.waterfall([
			async.apply(getPlantIDs,user.local.userID,plantid),
			getPlant

		], function (err, data) {
			if(err)
				done(err,null);
			else
				done(null,data);
		});

	},

	updatePlantForUser:function(user,plant,async,apns,APoptions,apnsConnection,done){
		function getDevice(userid,plantid,callback){
			require('./models/device').findOne({UserID:userid,PlantID:plantid},function(err,dev){
				if(err) callback(err,null);
				else {
					callback(null,dev);
				}
			});
		};
		function updatePlant(dev,callback){
			var Plant=require('./models/plant');
			Plant.findOne({'id':dev.PlantID},function(err,plant_db){
				if(err) callback(err,null);
				else
				{
					plant_db.condition = {

						temp        : {hi:plant.temph,low:plant.templ},
						ph          : {hi:plant.phh,low:plant.phl},
						light       : plant.light,
						nutrient    : {hi:plant.nutrienth,low:plant.nutrientl},
						moisture    : plant.moisture
						};
					plant_db.plantName=plant.name;

					plant_db.save(function(err){
						delete plant.PlantID;
						if (err){ callback(err,null,null);}
						callback(null,dev,plant);
					});
				}

			});

		};
		function nofityDevice(device,plant,callback){
			if(!device.APNAToken)
			console.error('Token Not properly set');
			var token = device.APNAToken;
			console.log(token);
			//it should be device.APNAToken
			var myDevice = new apns.Device(token);

			//console.log("The device "+device.DeviceID +" has been notified of the change");
			var notifyData={
				AID:device.ArduinoID, UID:device.UserID, DN:device.DeviceName,
				Plant:plant
			};
			var note = new apns.Notification();
			note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
			note.payload = {'data': notifyData};
			note.device = myDevice;
			apnsConnection.sendNotification(note);
			console.log(notifyData);
			callback(null,"done");

		};
		async.waterfall([
			async.apply(getDevice,user.local.userID,plant.PlantID),
			updatePlant,
			nofityDevice

		], function (err, data) {
			if(err)
				done(err,null);
			else
				done(null,data);
		});

	},
	logPlantUpdate:function(plantcondition,user,async,done){
		function getDevice(userid,arduinoid,callback){
			require('./models/device').findOne({UserID:userid,ArduinoID:arduinoid},function(err,dev){
				if(err) callback(err,null);
				else if(dev==undefined||dev==null){
					callback("No Device Found matching with the information ",null);
				}
                else{
                    callback(null,dev);
                }
			});
		};
		function createPlantCondition(device,callback){
			var plantcondition_db= require('./models/plantcondition')();
			plantcondition_db.condition=plantcondition.condition;
			plantcondition_db.PlantID=device.PlantID;
			plantcondition_db.UserID=device.UserID;
			plantcondition_db.DeviceID=device.DeviceID;
			plantcondition_db.ArduinoID=plantcondition.ArduinoID;
			plantcondition_db.actuatorstatus=plantcondition.actuatorstatus;
			plantcondition_db.boot=plantcondition.boot;
			plantcondition_db.APNAToken=plantcondition.APNAToken;
            callback(null,plantcondition_db,device);

		};
        function savePlantCondition(plantc,device,callback){
          plantc.save(function (err) {
              if(err) callback(err,null,null);
              else callback(null,plantc,device);
          });
        };
		function saveDevicewithUpdate(plantc,device,callback){
			device.actuatorStatus=plantcondition.actuatorstatus;
			require('./models/device').update({DeviceID:device.DeviceID},{$set:{actuatorStatus:plantcondition.actuatorstatus,APNAToken:plantcondition.APNAToken}}, function (err) {
				if(err){
					callback(err,null);
				}
				else
				callback (null,plantc);
			});
		};
		function notifyWebServer(plantCondition,callback){
			console.log("The web app for user "+plantCondition.UserID +" has been notified of the change");
			callback(null,plantCondition.timestamp);
		};

		async.waterfall([
			async.apply(getDevice,user.userID,plantcondition.ArduinoID),
			createPlantCondition,
            savePlantCondition,
			saveDevicewithUpdate,
			notifyWebServer
		], function (err, data) {
			if(err)
				done(err);
			else
				done(null,data);
		});

	},
    logPlantUpdates:function(plantconditionarr,user,async,done){
        function getDevice(userid,plantid,plantcond,callback){
            require('./models/device').findOne({UserID:userid,PlantID:plantid},function(err,dev){
                if(err) callback(err,null);
                else if(dev==undefined||dev==null){
                    callback("No Device Found matching with the information ",null,null);
                }
                else{
                    callback(null,dev,plantcond);
                }
            });
        };
        function createPlantCondition(device,plantcond,callback){
            var plantcondition_db= require('./models/plantcondition')();
            plantcondition_db.condition=plantcond.condition;
            plantcondition_db.PlantID=device.PlantID;
            plantcondition_db.UserID=device.UserID;
            plantcondition_db.DeviceID=device.DeviceID;
            plantcondition_db.actuatorstatus=plantcond.actuatorstatus;
            callback(null,plantcondition_db);

        };
        function savePlantCondition(plantc,callback){
            plantc.save(function (err) {
                if(err) callback(err,null);
                else callback(null,plantc);
            });
        };
        function notifyWebServer(plantCondition,callback){
            console.log("The web app "+plantCondition.UserID +" has been notified of the change");
            callback(null,"done");
        };
        function logPlantUpdate(plantcondition,user,async,callback){
            async.waterfall([
                async.apply(getDevice,user.userID,plantcondition.PlantID,plantcondition),
                createPlantCondition,
                savePlantCondition,
                notifyWebServer
            ], function (err, data) {
                if(err)
                    callback(err);
                else
                    callback(null,data);
            });
        };
        async.each(plantconditionarr,function(logPlantobj,callback){
            logPlantUpdate(logPlantobj,user,async,callback);

        },function(err){
            if(err)
             done(err,null);
            else
             done(null,"done");
        });

    },
    logActuatorUpdate: function (actuatorupdate,user,arduinoID,async,done) {
        function getDevice(actuatorupdate,userid,arduinoID,callback){
            require('./models/device').findOne({UserID:userid,ArduinoID:arduinoID},function(err,dev){
                if(err) callback(err,null);
                else if(dev==undefined||dev==null){
                    callback("No Device Found matching with the information ",null);
                }
                else{
                    callback(null,dev,actuatorupdate);
                }
            });
        };
        function saveDevicewithUpdate(device,actuatorupdate,callback){
            device.actuatorStatus=actuatorupdate;
            device.save(function (err) {
               if(err) callback(err);
                else callback(null,device);
            });
        };
        async.waterfall([
            async.apply(getDevice,actuatorupdate,user.userID,arduinoID),
            saveDevicewithUpdate

        ], function (err, data) {
            if(err)
                done(err,null);
            else
                done(null,data);
        });


    },
	getPlantUpdates: function (done, async,userid, plantid, limit, days) {
		function getDevice(userid,plantid,callback){
			require('./models/device').findOne({UserID:userid,PlantID:plantid},function(err,dev){
				if(err) callback(err,null);
				else if(dev==undefined||dev==null){
					callback("No Device Found matching with the information ",null);
				}
				else{
					callback(null,dev,limit,days,plantid);
				}
			});
		};
		function getPlantLogs(device,limit,days,plantid,callback){
			var PlantCondition= require('./models/plantcondition');
			var cutoff = (new Date());
			cutoff.setDate(cutoff.getDate()-days);
			var q= PlantCondition.find({timestamp:{$gte:cutoff},PlantID:plantid,boot:{$ne:true}});
			if(limit!=null&&limit!=undefined){
				q.limit(limit);
			}
			q.sort({timestamp:1});
			q.exec(function (err, logs) {
				if(err)
				callback(err,null);
				else
				callback(null,logs);
			});


		};


		async.waterfall([
			async.apply(getDevice,userid,plantid),
			getPlantLogs

		], function (err, data) {
			if(err)
				done(err,null);
			else
				done(null,data);
		});
	},

	getLatestPlantUpdate: function (done, async, userid, plantid) {
		function getDevice(userid,plantid,callback){
			require('./models/device').findOne({UserID:userid,PlantID:plantid},function(err,dev){
				if(err) callback(err,null);
				else if(dev==undefined||dev==null){
					callback("No Device Found matching with the information ",null);
				}
				else{
					callback(null,dev,plantid);
				}
			});
		};
		function getPlantLog(device,plantid,callback){
			var PlantCondition= require('./models/plantcondition');
			var q= PlantCondition.find({PlantID:plantid});

			q.sort({timestamp:1});
			q.limit(1);
			q.exec(function (err, logs) {
				if(err)
					callback(err,null);
				else
					callback(null,logs);
			});


		};

		async.waterfall([
			async.apply(getDevice,userid,plantid),
			getPlantLog

		], function (err, data) {
			if(err)
				done(err,null);
			else
				done(null,data);
		});
	},

	getAllArduinoDevices:function(user,async,done){
		var newDevices=[];
		require('./models/device').find({UserID:user.local.userID,DeviceName:{ $ne: null },PlantID:{$ne:null}},function(err,dev){
			if(err) done(err);
			async.forEachOf(dev,function(item,index,callback){
					var Plant=require('./models/plant');
					Plant.findOne({'id':item.PlantID},function(err,plant){
						if(err) callback(err,null);
						else{
							newDevices.push({device:item,plant:plant});
							callback();
						}
					});

			},function(err){
				if(err)
				 done(err,null);
				else
				done(null,newDevices);
			});

		});
	}


	// getAllSystemLog:function(user,async){


	// 	function getPlantLog(device,plantid,callback)
	// 	{
	// 		var PlantCondition= require('./models/plantcondition');
	// 		var q= PlantCondition.find({PlantID:plantid});

	// 		q.sort({timestamp:1});
	// 		q.limit(1);
	// 		q.exec(function (err, logs) {
	// 			if(err)
	// 				callback(err,null);
	// 			else
	// 				callback(null,logs);
	// 		});

	// 	};


	// 	var userPlants = require('.models/')
	// }


}