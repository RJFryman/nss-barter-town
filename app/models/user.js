'use strict';
var bcrypt = require('bcrypt');
var path = require('path');
var fs = require('fs');
var users = global.nss.db.collection('users');
var Mongo = require('mongodb');

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
