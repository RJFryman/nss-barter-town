'use strict';

exports.index = function(req, res){
  res.render('home/index', {title:'Welcome to Sweet Junk!'});
};

exports.about = function(req, res){
  res.render('home/about', {title:'About Us'});
};

/*
exports.test = function(req, res){
  res.render('emails/registration');
};
*/
