// app/models/plant.js
// load the things we need
var mongoose = require('mongoose');
var shortid = require('shortid');
var plantSchema = mongoose.Schema({
    userid:{type:String,'default':'root'},
    id				: {
        type: String,
        unique: true,
        'default': shortid.generate
                        },
    plantName       : String,
    readOnly        : Boolean,
    condition       : {
        temp        : { hi:Number, low:Number},
        ph          : { hi:Number, low:Number},
        light       : Number,
        nutrient    : {hi:Number, low:Number},
        moisture    : Number 
                      },
    parent          :{type:String, 'default':null}
    

});
plantSchema.options.toJSON= {
    transform: function(doc, ret) {
        delete ret._id;
        delete ret.__v;
    }
};

// create the model for plants and expose it to our app
module.exports = mongoose.model('Plant', plantSchema);