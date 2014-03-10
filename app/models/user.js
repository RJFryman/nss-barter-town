'use strict';
var bcrypt = require('bcrypt');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var users = global.nss.db.collection('users');
var Mongo = require('mongodb');
var request = require('request');
var jade = require('jade');

module.exports= User;

function User(user){
  this.name = user.name;
  this.email = user.email;
  this.password = user.password;
}

User.prototype.hashPassword = function(fn){
  var self = this;
  bcrypt.hash(self.password, 8, function(err, hash){
    self.password = hash;
    fn();
  });
};

User.prototype.addPic = function(oldpath, fn){
  var filename = path.basename(oldpath);
  var abspath = __dirname + '/../static';
  var relpath = '/img/users/' + filename;

  fs.renameSync(oldpath, abspath+relpath);

  this.pic = relpath;

  fn();
};

User.prototype.insert = function(fn){
  var self = this;
  users.findOne({email:this.email}, function(err, record){
    if(!record){
      users.insert(self, function(err, record){
        fn(record);
      });
    }else{
      fn(err);
    }
  });
};

User.prototype.sendRegistrationEmail = function(fn){
  // Load actual template text
  var template = fs.readFileSync(__dirname + '/../static/emails/template.jade', 'utf8');
  var content = fs.readFileSync(__dirname + '/../static/emails/register.jade', 'utf8');

  // Compile template rendering function
  template = jade.compile(template, { pretty: true, filename: __dirname + '/../static/emails/template.jade' });
  content = jade.compile(content, { pretty: true, filename: __dirname + '/../static/emails/register.jade'});

  // Render jade template, passing in the info
  var output = content({ body: template(), name:this.name });

  var key = process.env.MAILGUN;
  var url = 'https://api:' + key + '@api.mailgun.net/v2/sandbox15938.mailgun.org/messages';
  var post = request.post(url, function(err, response, body){
    fn();
  });
  var form = post.form();
  form.append('from', 'robert.fryman@gmail.com');
  form.append('to', this.email);
  form.append('subject', 'Time to Sweet Your Junk!');
  form.append('html', output);
};

User.deleteById = function(id, fn){
  var _id = Mongo.ObjectID(id);
  User.findById(id, function(user){
    console.log('USER PIC PATH: ' + user.pic);
    var cmd = 'rm -rf ' + __dirname + '/../static' + user.pic;
    exec(cmd, function(){
      users.remove({_id:_id}, function(err,count){
        fn(count);
      });
    });
  });
};

User.prototype.update = function(fn){
  users.update({_id:this._id},this, function(err,count){
    fn(count);
  });
};

User.findById = function(id, fn){
  var _id = Mongo.ObjectID(id);
  users.findOne({_id:_id}, function(err, record){
    fn(record);
  });
};

User.findByEmailAndPassword = function(email, password, fn){
  users.findOne({email:email}, function(err, record){
    if(record){
      bcrypt.compare(password, record.password, function(err, result){
        if(result){
          fn(record);
        }else{
          fn(null);
        }
      });
    }else{
      fn(null);
    }
  });
};
