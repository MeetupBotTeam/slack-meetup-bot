// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var moment = require('moment')
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.post('/meetupbot', function(req, res){
  //console.log(req.headers);
  console.log(JSON.stringify(req.body));
  var userName = req.body.user_name;
  var reply = {
    "text": "Hello, "+userName+" I am a MeetupBot. I show list of meetups going on near your location.\n Try following commands :", 
    "attachments": [
        {
            title: "1) /meetupbot-find <location> (& <interest>)",
            text: "use this to find local meetup-groups based on your location \nfor ex: /meetupbot-find New-York"
            + "\noptional: add parameter for your interests: '/meetupbot-find New-York & <interest>'",
            color: "#764FA5"
        },
        {
        title: "2) /meetupbot-show <location> & <interest>", 
        text: "use this to find events based on location and your interests \nfor ex: /meetupbot-show Mumbai & Javascript (Don't forget to use ampersand (&).)",
        color: "#764FA5"
        }
        ]
  };
  res.json(reply);
  
});

app.post('/meetupbot-show', function(req, res) {
  /* /meetupbot-show <Location> <Category/Interest> */
  var userName = req.body.user_name;
  var commandText = req.body.text;
  var area = commandText.split('&')[0];
  var interest = commandText.split('&')[1];
  console.log("command is "+commandText);
  var reply = {};
  var location={};
  var attachment=[];
  if(!commandText || commandText == undefined){
    reply.text = 'Please provide a location along with the command @'+userName+'\nFor ex: /meetupbot-show Mumbai & Javascript.';
    return res.json({text: reply.text});
  } else if(interest =='' || interest == undefined){
    reply.text = 'Please provide a location & search term along with the command @'+userName+'\nFor ex: /meetupbot-show Mumbai & Javascript.\nIt helps in filtering the list of meetups according to your interest :blush:.'+'\nActually it will be difficult to show a long list of meetups for me right now :stuck_out_tongue_winking_eye:.';
    res.json(reply);
  } else {
     reply.text = 'Hey '+userName+',\nThis is the list of meetups near '+area+'.';
     getGeoCode(area)
       .then((data) => {
         location.lat = data.lat;
         location.lon = data.lng;
         getMeetupEvents(location, interest)
           .then((events) =>{
             if(events.length == 0){
               reply.text = 'No Meetups found in '+area+' :sleuth_or_spy: .\nMake sure the location you entered is correct and try again.:slightly_smiling_face:';
               return res.json(reply);
             }
             events.forEach((event) => {
               var status = (event.status != undefined) ? ('Status - '+event.status) : 'Status - visible only to Members';
               var desc = event.description ? event.description.split('</p>')[0] :  "Description - Only visible to members.";
               var date = new Date(event.time + event.utc_offset);
               date = moment(date).format('lll');
               var venue = (event.venue != undefined) ? event.venue.address_1 : 'Only visible to members';
               attachment.push({
                 title: 'Group - '+event.group.name,
                 text: '<'+event.link+'| Event - '+event.name+'>',
                 author_name: status,
                 title_link: 'https://www.meetup.com/'+event.group.urlname,
                 color: "#764FA5",
                 fields: [
                      {
                          "title": "Date",
                          "value": date,
                          "short": true
                      },
                      {
                          "title": "Venue",
                          "value": venue,
                          "short": true
                      },
                      {
                          "title": "RSVP Count",
                          "value": event.yes_rsvp_count,
                          "short": true
                      }
                ]
               });
             });
             reply.attachments = attachment;
             return res.json(reply);
           }) // catch for getMeetupEvents
           .catch((e) => {
             console.log("error occured in getMeetupEvents promise as "+e);
             return res.json({text: 'Ops something went wrong. Please try again :blush:'});
           });
       }) // catch for getGeoCode
      .catch((e) => {
         console.log("error in geocode as "+e);
         return res.json({text: 'Ops something went wrong. Please try again :blush:'});
       }); 
  }
});

app.post('/meetupbot-find', function(req, res){
    var location = {};
    var commandText = req.body.text.replace(" ", "");
    if(commandText.includes("&")) {
    var area = commandText.split("&")[0];
    var interest = commandText.split("&")[1];
    } else {
      var area = commandText;
      var interest = "";
    }
    var userName = req.body.user_name;
    var reply = {};
    
    if(!commandText || commandText == undefined){
        reply.text = '@' + userName + ' Please provide a location along with the command \nFor ex: /meetupbot-find London'
        + ' (& <category>)';
        return res.json(reply);
    } else if(interest === undefined) {
        reply.text = '@' + userName + ' Please use the correct syntax: /meetupbot-find <location> & <interest>';
        return res.json(reply);
    } else {
        reply.text = "Hey @" + userName +"\nThose are the groups near " + area;
        if(interest) reply.text += " for " + interest;
        
        getGeoCode(area)
        .then(function(data) {
            location.lat = data.lat;
            location.lon = data.lng;
            
            findMeetupGroups(location, interest)
            .then(function(groups) {
                if (groups.length === 0) {
                    reply.text = 'No groups found near '+area+' :sleuth_or_spy: .\nMake sure the location you entered is correct ' 
                    + 'and you didn\'t forget the "&". \nPlease  try again.:slightly_smiling_face:';
                    return res.json(reply);
                } else if (groups.length > 20) {
                    reply.attachments = [];
                    for (var i = 0; i <21; i++) {
                        var current = groups[i];
                        composeAttachments(reply.attachments, current);
                    };
                    return res.json(reply);
                } else {
                    reply.attachments = [];
                    groups.forEach(function(group) {
                        composeAttachments(reply.attachments, group);
                    });
                    return res.json(reply);
                }
                
            })
            .catch(function() { //catch for findMeetupGroups
                return res.json({text: 'Ops something went wrong. Please try again :blush:'});
            })
        })
        .catch(function() { // catch for getGeoCode
            return res.json({text: 'Ops something went wrong. Please try again :blush:'});
        });
    }
    
});

/*
*function to get the Geocode from google geocode API.
*/
function getGeoCode(location){
  return new Promise(function(resolve, reject) {
    var options = {
      method: 'GET',
      url: 'http://maps.googleapis.com/maps/api/geocode/json',
      qs: { address: location }
    };

    request(options, function (error, res, body) {
      if (error) {
        console.log("Error occured in getGeoCode as "+error);
        reject();
      }
      else{
        body = JSON.parse(body);
        var loc = body.results[0].geometry.location;
        resolve(loc);
      }
    });
  });
}
/*
*function to get meetups near your city/town/location using meetup API
*/
function getMeetupEvents(location, interest) {
  var key = process.env.SECRET;
  
  return new Promise((resolve, reject) => {
    var options = { method: 'GET', 
      url: 'https://api.meetup.com/find/events',
      qs: {
        key: key,
        lat: location.lat,
        lon: location.lon,
        text: interest,
        radius: 10
      }
    };

    console.log(options);
    request(options, function (error, response, body) {
      if (error) {
        console.log("error occured in getMeetupEvents as "+error);
        reject();
      } else{
        body = JSON.parse(body);
        console.log(body.length);
        resolve(body);
      }
    });
  });
};

/*
*function to get meetup-groups near your city/town/location using meetup API
*/
function findMeetupGroups (location, interest) {
    var key = process.env.SECRET;
    
    return new Promise(function(resolve, reject) {
        var options = {
            method: "GET",
            url: "https://api.meetup.com/find/groups",
            qs: {
                key: key,
                lat: location.lat,
                lon: location.lon,
                radius: 10
            }
        }
        if(!(interest === undefined || interest === "")) options.qs.text = interest;
        console.log(options);
        
        //api-request
        request(options, function(error, response, body) {
           if(error) {
               console.log("error occured in findMeetupGroups: " + error);
               reject
           } else {
               body = JSON.parse(body);
              // console.log(response);
               resolve(body);
           }
        }); 
    });
};

//function to help compose reply
function composeAttachments(arr, obj){
    arr.push({
                            title: obj.name,
                            text: obj.description,
                            fields: [
                                {
                                    "title": "Link",
                                    "value": obj.link,
                                    "short": true
                                },
                                {
                                    "title": "Members",
                                    "value": obj.members,
                                    "short": true
                                },
                            ]
                        })
}

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
