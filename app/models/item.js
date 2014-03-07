'use strict';

module.exports = Item;

var _ = require('lodash');
var Mongo = require('mongodb');

function Item(data){
  this.name = data.name;
  this.year = parseInt(data.year);
  this.description = data.description;
  this.photos = [];
  this.cost = parseInt(data.cost);
  this.tags = data.tags.split(',').map(function(tag){return tag.trim();});
  this.tags = _.compact(this.tags);
  this.state = 'available';
  this.userId = Mongo.ObjectID(data.userId);
  this.offers = [];
}

//-------------------------------------------------------//
//    NOT TESTED!!    //
/*
Item.prototype.insert = function(fn){
  var self = this;

  items.insert(self, function(err, records){
    fn(err)
  });
};

Item.findByUserId = function(userId, fn){
  userId = Mongo.ObjectID(userId);

  items.find({userId:userId}).toArray(function(err, records){
    fn(records);
  });
};

Item.deleteAllByUserId = function(userId, fn){
  userId = Mongo.ObjectID(userId);
  items.find({userId:userId}).toArray(function(err, records){
    for(var i = 0; i < records.length; i++){
      items.remove({userId:userId}, function(err, count){
        fn(count);
      });
    };
  });
};

Item.findById = function(id, fn){
  var _id = Mongo.ObjectID(id);

  items.findOne({_id:_id}, function(err, record){
    fn(record);
  });
};

Item.findBytags = function(tag, fn){
  items.find({tags:tag}, function(err, records){
    fn(records);
  });
};

Item.deleteById = function(id, fn){
  var _id = Mongo.ObjectID(id);

  items.remove({_id:_id}, function(err, count){
    fn(count);
  });
};
*/
