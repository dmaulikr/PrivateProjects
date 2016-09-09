// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var shortid = require('shortid');

// define the schema for our user model
var userSchema = mongoose.Schema({

     local            : {
        email        : String,
        password     : String,
        userID       : { type: String,unique: true,'default': shortid.generate},
        Name        : String,
        Phone           : String,
        DateOfBirth     : String,
         securiyQuestion: String,
         secretAnswer   :String
    },
    APNAToken	: {type:String,'default':"TokenNotIssued"},
    iphoneid    : {type:String,'default':"Id not Updated"}

});
// generating a hash
userSchema.options.toJSON= {
    transform: function(doc, ret) {
        delete ret._id;
        delete ret.__v;
    }
};

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};
userSchema.methods.getDetails= function() {
    var data=this.local.toObject();
    data.token=this.APNAToken;
    data.iphoneid=this.iphoneid;
    return data;

};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);