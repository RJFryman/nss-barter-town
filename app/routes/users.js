'use strict';

var User = require('../models/user');
var request = require('request');

exports.auth = function(req, res){
  res.render('users/auth', {title: 'User Sign Up'});
};

exports.register = function(req, res){
  var user= new User(req.body);
  user.hashPassword(function(){
    user.addPic(req.files.pic.path, function(){
      user.insert(function(){
        if(user._id){
          var key = process.env.MAILGUN;
          var url = 'https://api:' + key + '@api.mailgun.net/v2/sandbox46639.mailgun.org/messages';
          var post = request.post(url, function(err, response, body){
            res.redirect('/');
          });
          var form = post.form();
          form.append('from', 'robert.fryman@gmail.com');
          form.append('to', user.email);
          form.append('subject', 'Welcome to Bartertown!');
          form.append('text', 'Hello, ' + user.name + ', it\'s time to barter your crap.');
        }else{
          res.redirect('/register');
        }
      });
    });
  });
};

exports.login = function(req, res){
  User.findByEmailAndPassword(req.body.email, req.body.password, function(user){
    if(user){
      req.session.regenerate(function(){
        req.session.userId = user._id.toString();
        req.session.save(function(){
          res.send({success:true});
        });
      });
    }else{
      req.session.destroy(function(){
        res.send({success:false});
      });
    }
  });
};

exports.logout = function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
};


exports.show = function(req, res){
  User.findById(req.params.id, function(user){
    res.render('users/show', {validUser:user});
  });
};
