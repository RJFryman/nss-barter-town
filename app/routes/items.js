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

exports.find = function(req, res){
  Item.find(req.query, function(items){
    res.send({items:items});
  });
};

exports.show = function(req, res){
  Item.findById(req.params.id, function(item){
    User.findById(item.userId.toString(), function(owner){
      var offers = [];
      _.forEach(item.offers, function(e){
        Item.findById(e.toString(), function(foundOffer){
          offers.push(foundOffer);
        });
      });
      Item.findByUserId(req.session.userId, function(myItems){
        res.render('items/show', {item:item, owner:owner, offers:offers, myItems:myItems});
      });
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


exports.addImage = function(req, res){
  Item.findById(req.params.id, function(item){
    item.addPhoto(req.files.pic.path, req.files.pic.name, function(err){
      item.update(function(){
        res.redirect('/items/'+ item._id.toString());
      });
    });
  });
};

//not tested
exports.removePic = function(req, res){
  Item.findById(req.params.id, function(item){
    item.removePhoto(req.body.url, function(removed){
      item.update(function(){
        res.send({item:true});
      });
    });
  });
};


exports.destroy = function(req, res){
  Item.findById(req.params.id, function(item){
    if(!item.offered){
      if(req.session.userId === item.userId.toString()){
        var cmd = 'rm -rf ' + __dirname + '/../static' + item.photoPath;
        Item.deleteById(req.params.id, function(){
          exec(cmd, function(){
            res.redirect('/users/'+req.session.userId);
          });
        });
      }
    }else{
      res.redirect('/users/'+req.session.userId);
    }
  });
};

exports.addOffer = function(req, res){
  Item.findById(req.params.item, function(item){
    item.addOffer(req.params.itemOffer);
    Item.findById(req.params.itemOffer, function(itemOffer){
      itemOffer.toggleOffered();
      item.update(function(){
        itemOffer.update(function(){
          res.send({success:true});
        });
      });
    });
  });
};

exports.removeOffer = function(req, res){
  Item.findById(req.params.item, function(item){
    item.removeOffer(req.params.itemOffer);
    Item.findById(req.params.itemOffer, function(itemOffer){
      itemOffer.toggleOffered();
      item.update(function(){
        itemOffer.update(function(){
          res.redirect('/items/' + req.params.item);
        });
      });
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
      item.removeOffer(req.params.itemOffer);
      itemOffer.toggleOffered();
      item.update(function(){
        itemOffer.update(function(){
          item.sendAcceptEmail(itemOffer.name, function(){
            itemOffer.sendAcceptEmail(item.name, function(){
              res.redirect('/users/'+req.session.userId);
            });
          });
        });
      });
    });
  });
};
