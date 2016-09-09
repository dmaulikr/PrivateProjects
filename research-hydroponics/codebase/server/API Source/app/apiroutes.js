// app/routes.js
module.exports = function(app,mongoManager, mongoose, passport) {
    var async= require('async');
    var apns = require("apn"), APoptions;

    APoptions = {
        key:  'deleted',                  /* Key file path */
        keyData: null,                    /* String or Buffer containing key data, as certData */
        passphrase: '<passphrase>',                 /* A passphrase for the Key file */
        ca: null,
        production:false,
        cert: 'deleted',                 /* Certificate file path */
        certData: null,/* String or Buffer of CA data to use for the TLS connection */
        gateway: 'gateway.sandbox.push.apple.com',/* gateway address */
        port: 2195,                       /* gateway port */
        enhanced: true,                   /* enable enhanced format */
        errorCallback: function(err){console.log(err)},         /* Callback when error occurs function(err,notification) */
        cacheLength: 100
    };
    var apnsConnection = new apns.Connection(APoptions);
    /* ------------------------------The api private for testingAPNS-------------------------------------*/
    app.get('/push', function (req, res) {
        var token = '1f90ec6e98f9ddf719ce78c969f9f851db554956ee4cbd6396fb1f8f5d71b588';

        var myDevice = new apns.Device(token);

        var note = new apns.Notification();

        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        note.badge = 3;
        note.sound = "ping.aiff";
        note.alert = "You have a new message";
        note.payload = {'messageFrom': 'Caroline'};
        note.device = myDevice;
        apnsConnection.sendNotification(note);
        res.json(200,{message:"trying to send it to iphone"});

    });
 /*---------------------- UI Responses -------------- */ 
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    app.get('/login',isNotLoggedIn, function(req, res) {
        var redirecturi=(req.query.redirectUri!=undefined &&req.query.redirectUri!=null && req.query.redirectUri!='undefined' )?req.query.redirectUri : '/success';
        // render the page and pass in any flash data if it exists


        res.render('login.ejs', {message:'',redirectUri:redirecturi });
    });
    app.get('/success',isLoggedIn,function(req,res){
        res.render('success.ejs');
    });
  /*  app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });*/
    app.get('/logout', function(req, res) {
        req.logout();
        res.json({message: "Good bye !! you are logged out"});
    });
    // process the signup form
    /*
    app.post('/signup', passport.authenticate('local-signup'),function (req,res) {
        if(req.user){
            mongoManager.createUser(req.user.local.email,req,res);
        }
        else{
            res.render('signup.ejs', { message: req.flash(' Error in signup') });
        }


        
    });
*/
    // process the login form
   /* app.post('/login', passport.authenticate('local-login'), function (req, res) {
        var redirecturi=req.query.redirectUri || req.body.redirectUri;
        if(req.user){
            res.redirect(redirecturi);
            // res.json({message: "Hello authenticated user : "+req.user.local.email});
        }
        else{
            res.render('login.ejs', {message:'Invalid Credentials!!',redirectUri:redirecturi });
        }
    });*/

    // app.post('/')

    app.post('/login', function(req, res, next) {
        var redirecturi=req.query.redirectUri || req.body.redirectUri || '/success';
        if(redirecturi=='undefined') redirecturi='/success';
        passport.authenticate('local-login', function(err, user, info) {
            if (err) { return next(err); };
            if (!user) { return res.render('login.ejs', {message:'Invalid Credentials!!',redirectUri:redirecturi }); };
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.redirect(redirecturi);
            });
        })(req, res, next);
    });


 /*---------------------- API Responses for user operations-------------- */ 
    app.get('/api',function (req,res) {
        mongoManager.welcomeEveryone(mongoose,res);
    });
   /* app.get('/api/plants',isLoggedIn,function (req,res) {
        res.json({message:"Hey you there"});
    });*/
    //apilogin method
    app.post('/api/login',passport.authenticate('local-login-api'),function (req, res) {
        var redirecturi=req.params.redirecturi;
        if(req.user){
            //res.redirect(redirecturi);
            res.json({message: "Hello authenticated user : "+req.user.local.email});
        }
        else{
            res.json(401,{message:"The password/email combination is wrong"});
        }
    });
    //this thing is working
    app.post('/api/signup', passport.authenticate('local-signup'),function (req,res) {
        mongoManager.createUser(req.user.local.email,req,res);
    });
    //apichecklogin 
    app.get('/api/checkme',isLoggedIn,function (req,res) {
        res.json({message: "Hello again authenticated user : "+req.user.local.email});
    });
    //api logout
    app.get('/api/logout', function(req, res) {
        req.logout();
        res.json({message: "Good bye !! you are logged out"});
    });

    app.get('/api/getuserdata',isLoggedIn, function (req, res) {
        mongoManager.getUserData(req,res);
    });

    app.post('/api/updatetoken',isLoggedIn,function(req,res){
        mongoManager.updateToken(req.user,req.body.apnatoken,function(err,data){
            if(err) res.json(500,{message:"Error updating token"});
            res.json(200,{message:"token updated successfully"});
        })
    });
    app.post('/api/updateiphoneid',isLoggedIn,function(req,res){
        mongoManager.updateIphoneId(req.user,req.body.iphoneid,function(err,data){
            if(err) res.json(500,{message:"Error updating iphone ID"});
            res.json(200,{message:"iphone ID updated successfully"});
        })
    });
/*------------------------------ Plants operations-------------------------------*/
    app.post('/api/insertplant',isLoggedIn,function(req,res){
        mongoManager.insertPlant(mongoose,req,function(err){
           if(err) res.json({message:"Error creating plant"});
            res.json(200,{message:"Plant created successfully"});
        });
    });
    app.post('/api/createchildplant',isLoggedIn,function(req,res){
        mongoManager.createChildPlant(req.body,req.user,function(err,plant){
            if(err) res.json({message:"Error creating plant"});
            res.json(200,{message:"Plant created successfully",data:plant});
        });
    });


    app.get('/api/getrootplants',isLoggedIn,function(req,res){
        mongoManager.getRootPlants(res,function(err,plants){
            if(err) res.json({message:"Error retrieving plants"});
            res.json(200,{message:"List of Root Plants",data:plants});
        });
    });

    app.get('/api/getplantsforuser',isLoggedIn, function (req, res) {
        var async= require('async');
       mongoManager.getPlantsForUser(req.user,async,function(err,plants){
           if(err) res.json({message:"Error retrieving plants"});
           res.json(200,{message:"List of Plants",data:plants});
       });
    });
    app.get('/api/getplant/:plantID',isLoggedIn, function (req,res) {
        var async= require('async');
        mongoManager.getPlantForUser(req.user,req.params.plantID,async,function(err,plant){
            if(err) res.json({message:"Error retrieving plant"});
            res.json(200,{message:"requsted plant",data:plant});
        });
    });
    app.get('/api/getplantforarduino/:arduinoID',isLoggedIn, function (req,res) {
        var async= require('async');
        mongoManager.getPlantForArduino(req.user.local.userID,req.params.arduinoID,async,function(err,plant){
            if(err) res.json({message:"Error retrieving plant"});
            res.json(200,{message:"requsted plant",data:plant});
        });
    });

    app.get('/api/getallplants',isLoggedIn, function (req, res) {
        mongoManager.getAllPlants(req.user.local.userID,function(err,plants){
           if(err)
            res.json(500,{message:'error retrieving plants',data:err});
            else
               res.json(200,{message:"List of Plants",data:plants});
        });
    });

    app.post('/api/updateandnotifyplant',isLoggedIn, function (req, res) {
        var async= require('async');
        mongoManager.updatePlantForUser(req.user,req.body.plant,async,apns,APoptions,apnsConnection,function(err,msg){
            if(err) res.json(500,{message:"Error updating plant, call other APIs and check whether update happened"});
            res.json(200,{message:"Plant Updated and notified by server ",data:msg});
        });
    });

/*------------------------------ Devices operations-------------------------------*/

    app.post('/api/requestdevice',isLoggedIn,function(req,res){
        mongoManager.requestDevice(req.user,res,function(err){
            if(err) res.json({message:"Error creating device"});
        });
    });

    app.post('/api/updatedevice',isLoggedIn,function(req,res){
        mongoManager.updateDevice(req.body.device,res, function(err){
            if(err) res.json({message:"Error updating device"});
        });
    });

    app.get('/api/getalldevices',isLoggedIn, function (req,res) {
        mongoManager.getAllDevices(req.user,res,function(err){
            if(err) res.json({message:"Error retrieving devices"});
        });

    });

    app.get('/api/getallarduinos',isLoggedIn, function (req,res) {
        mongoManager.getAllArduinoDevices(req.user,async,function(err,devices){
            if(err) res.json({message:"Error retrieving devices"});
           else res.json({message:"requested list of devices of the user "+req.user.local.Name,data:devices});
        });

    });
    app.get('/api/getdevice/:deviceID',isLoggedIn, function (req,res) {
        mongoManager.getDevice(req.user,req.params.deviceID,res,function(err){
            if(err) res.json(500,{message:"Error retrieving devices"});
        });

    });

/*------------------------------ Analytics operations-------------------------------*/

    app.post('/api/logplantupdate',isLoggedIn, function (req, res) {
        mongoManager.logPlantUpdate(req.body,req.user.local, async,function (err, data) {
           if(err) res.send(500,{message:"Error Logging the data"});
            res.send(200,{message:"Log updated at : "+data});
        });
    });
    app.post('/api/logplantupdates',isLoggedIn, function (req, res) {
        mongoManager.logPlantUpdates(req.body,req.user.local, async,function (err, data) {
            if(err) res.send(500,{message:"Error Logging the data"});
            res.send(200,{message:"Log updated "});
        });
    });
    app.post('/api/logactuatorupdate',isLoggedIn, function (req, res) {
        mongoManager.logActuatorUpdate(req.body.actuatorstatus,req.user.local,req.body.ArduinoID,async, function (err, data) {
            if(err) res.send(500,{message:"Error Logging the data"});
            res.send(200,{message:"Log updated"});
        });
    });

    app.get('/api/getplantupdates/:PlantID',isLoggedIn, function (req, res) {
        var limit=req.param('limit');
        var days=req.param('days');
        mongoManager.getPlantUpdates(function (err, data) {
            if(err) res.send(500,{message:"Error retrieving the log"});
            res.send(200,{message:"Plantcondition updates", data:data});
        },async,req.user.local.userID,req.params.PlantID,limit,days);
    });
    app.get('/api/getlatestplantupdate/:PlantID',isLoggedIn, function (req, res) {
        mongoManager.getLatestPlantUpdate(function (err, data) {
            if(err) res.send(500,{message:"Error retrieving the log"});
            res.send(200,{message:"Plantcondition update", data:data});
        },async,req.user.local.userID,req.params.PlantID);
    });
};
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();
    else{
       res.json(401,{message:"User not authenticated. Call http://api.humandroid.us/login"});
    }

}
// route middleware to make sure a user is logged in
function isNotLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (!req.isAuthenticated())
        return next();
    else{
        var redirecturi=(req.query.redirectUri!=undefined &&req.query.redirectUri!=null && req.query.redirectUri!='undefined' )?req.query.redirectUri : '/success';
        res.redirect(redirecturi);
    }

}