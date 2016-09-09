/**
 * Created by root on 2/16/16.
 */
var mongoose = require('mongoose');
var shortid = require('shortid');
var plantConditionSchema = mongoose.Schema({
    id				: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    boot        : {type: Boolean, 'default':false},
    PlantID       : String,
    condition       : {
        temp        : Number,
        ph          : Number,
        light       : Number,
        nutrient    : Number,
        moisture    : Number
    },
    actuatorstatus:{
        PhBalance   : Boolean,
        Nutrition	: Boolean,
        Moisturizer	: Boolean,
        Light       : Boolean
    },
    UserID          : String,
    DeviceID        : String,
    APNAToken       : String,
    ArduinoID   : {type:String,'default':"ArduinoID not attached"},
    timestamp       : { type: Date, default: Date.now }
});
plantConditionSchema.options.toJSON= {
    transform: function(doc, ret) {
        delete ret._id;
        delete ret.__v;
    }
};

plantConditionSchema.methods.getPLantUpdate=function(){

};

// create the model for plants and expose it to our app
module.exports = mongoose.model('PlantCondition', plantConditionSchema);