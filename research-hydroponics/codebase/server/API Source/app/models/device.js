// app/models/device.js
// load the things we need
var mongoose = require('mongoose');
var shortid = require('shortid');
var deviceSchema = mongoose.Schema({
	DeviceName	: String,
	DeviceID	: {type: String,unique: true,'default': shortid.generate},
	PlantID		: String,
	UserID		: String,
    APNAToken	: {type:String,'default':"TokenNotIssued"},
    ArduinoID   : {type:String,'default':"ArduinoID not attached"},
    actuatorStatus	: {
        PhBalance	: Boolean,
        Nutrition	: Boolean,
        Moisturizer : Boolean,
        Light       : Boolean
    }
});

deviceSchema.options.toJSON= {
    transform: function(doc, ret) {
        delete ret._id;
        delete ret.__v;
    }
};
deviceSchema.methods.getPlantID=function(){
    return PlantID;
};
// create the model for device and expose it to our app
module.exports = mongoose.model('Device', deviceSchema);