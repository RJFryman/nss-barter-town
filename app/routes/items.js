'use strict';

var Item = require('../models/item');
var User = require('../models/user');
var exec = require('child_process').exec;
var _ = require('lodash');

exports.index = function(req, res){
  res.render('items/index');
};

exports.new = function(req, res){
  res.render('items/new');
};

exports.show = function(req, res){
  Item.findById(req.params.id, function(item){
    User.findById(item.userId.toString(), function(owner){
      var offers = _.map(item.offers, function(e){
        Item.findById(e._id.toString(), function(foundOffer){
          return foundOffer;
        });
      });
      res.render('items/show', {item:item, owner:owner, offers:offers});
    });
  });
};

exports.create = function(req, res){
  req.body.userId = req.session.userId;
  var item = new Item(req.body);
  item.insert(function(){
    item.mkDir(function(){
      item.addPhoto(req.files.photo.path, req.files.photo.name, function(){
        item.update(function(){
          res.redirect('/items/'+ item._id.toString());
        });
      });
    });
  });
};

exports.destroy = function(req, res){
  Item.findById(req.params.id, function(item){
    if(req.session.userId === item.userId.toString()){
      var cmd = 'rm -rf ' + __dirname + '/../static' + item.photoPath;
      Item.deleteById(req.params.id, function(){
        exec(cmd, function(){
          res.redirect('/users/'+req.session.userId);
        });
      });
    }
  });
};

exports.addOffer = function(req, res){
  Item.findById(req.params.item, function(item){
    item.addOffer(req.params.itemOffer);
    Item.findById(req.params.itemOffer, function(itemOffer){
      itemOffer.toggleOffered();
      res.redirect('/items/' + req.params.item);
    });
  });
};

exports.removeOffer = function(req, res){
  Item.findById(req.params.item, function(item){
    item.removeOffer(req.params.itemOffer);
    Item.findById(req.params.itemOffer, function(itemOffer){
      itemOffer.toggleOffered();
      res.redirect('/items/' + req.params.item);
    });
  });
};

exports.accept = function(req, res){
  Item.findById(req.params.item, function(item){
    Item.findById(req.params.itemOffer, function(itemOffer){
      var itemUserId = item.userId;
      var itemOfferUserId = itemOffer.userId;
      item.userId = itemOfferUserId;
      itemOffer.userId = itemUserId;
      itemOffer.toggleOffered();
      item.update(function(){
        itemOffer.update(function(){
          item.sendAcceptEmail();
          itemOffer.sendAcceptEmail();
          res.redirect('/user/'+req.session.userId);
        });
      });
    });
  });
};
