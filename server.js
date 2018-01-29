var connect = require('connect'),
    socketio = require('socket.io');

var fs = require("fs");
var guid = require('./guid')
var express = require('express');
var path = require('path');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var jsonfile = require('jsonfile');
var _ = require('underscore')
var ipAddress = getIPAddress();
var UPLOAD_FOLDER = 'results';
var STATIC_FOLDER = 'crowdpage';


var FULL_UPLOAD_FOLDER = path.join(__dirname, UPLOAD_FOLDER);
app.use(express.static(path.join(__dirname, STATIC_FOLDER)));

http.listen(4000, function(){
  console.log('listening on '+ipAddress+':4000  ......');

});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/crowdpage/index.html');
});

io.on('connection', function(socket) {
  var startingTime = 0
  socket.on('start', function() {
    startingTime = (new Date()).getTime()
    console.log(startingTime);
  })

  socket.on('results', function(data) {
    console.log(data);
    console.log(startingTime);
    // creating a new query ID
    var queryID = guid();
    // creaing a new json file for this query
    var filename = path.join(FULL_UPLOAD_FOLDER, queryID +'.json');
    var obj = {
      queryID: queryID,
      answer: data.answer,
      enterInstructionPageTime: startingTime,
      enterTaskTime: data.startTime,
      submittedTime: (new Date()).getTime()
    }
    writeJSON(filename, obj)
    io.emit('uniqueID', queryID);

  })
  socket.on('change', function(obj) {
    console.log(obj);
    data = obj;
    socket.broadcast.emit('change', data);
  });

  socket.on('query', function(queries, subjs){
    console.log(queries);
    // creating a new query ID
    var queryID = guid();
    // creaing a new json file for this query
    var filename = path.join(FULL_UPLOAD_FOLDER, queryID +'.json');
    var relatedQuery = []
    var subjectivity = []
    _.each(queries, function(val) {
      relatedQuery.push(val['text'])
    })
    _.each(subjs, function(val) {
      subjectivity.push(val['text'])
    })
    var obj = {
      queryID: queryID,
      query: queries[0]['text'],
      updated: (new Date()).getTime(),
      relatedQuery: relatedQuery,
      subjectivity: subjectivity,
      fakeData: './img/tired_1.png'
    }
    writeJSON(filename, obj)
    io.emit('query_display', obj);
  })

  socket.on('subjectivity', function(sub) {
    console.log(sub);
    socket.broadcast.emit('subjectives_display', sub);

  })
});

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
   next();
})

app.get('/list_queries', function(request, response) {
  console.log('got it');
	getRequests().then(function(question_id_list) {
    response.json(question_id_list);
	});
}).get('/get_query/:id', function(request, response) {
  var question_id = request.params.id;
	response.header('Access-Control-Allow-Origin', '*');
	response.sendFile(path.join(FULL_UPLOAD_FOLDER, question_id));
})


function writeJSON(filename, obj) {
  return new Promise(function(res, rej) {
    jsonfile.writeFile(filename, obj, {spaces: 2}, function(res, error){
      if (!error) console.log('good');
    })
  })
}


function readJSON(filepath) {
  return new Promise(function(res, rej) {
    jsonfile.readFile(filename, obj, function(res, error){
      if (!error) console.log('good');
    })
  })
}

function readdir(dirPath) {
	return new Promise(function(resolve, reject) {
		fs.readdir(dirPath, function(err, contents) {
			if(err) { reject(err); }
			else { resolve(contents); }
		});
	});
}

function getRequests() {
  // need other two functions stat, readdir
	var flist;
	return readdir(UPLOAD_FOLDER).then(function(file_list) {
		flist = file_list;
		var stats = _.map(file_list, function(name) {
			if(name.indexOf('.json') > 0) {
				return stat(path.join(UPLOAD_FOLDER, name));
			} else {
				return false;
			}
		});
		return Promise.all(stats);
	}).then(function(file_stats) {
		var question_id_list = {};
		_.each(file_stats, function(file_stat, i) {
			if(file_stat) {
				var name = flist[i];
				question_id_list[name] = file_stat.mtime.getTime();
			}
		});
		return question_id_list;
	});
}

function stat(path) {
	return new Promise(function(resolve, reject) {
		fs.stat(path, function(err, contents) {
			if(err) { reject(err); }
			else { resolve(contents); }
		});
	});
}


function getIPAddress() {
	var os = require('os');

	var interfaces = os.networkInterfaces();
	var addresses = [];
	for (var k in interfaces) {
	    for (var k2 in interfaces[k]) {
				var address = interfaces[k][k2];
					if (address.family === 'IPv4' && !address.internal) {
					    addresses.push(address.address);
				}
	    }
	}

	return addresses[0];
}
