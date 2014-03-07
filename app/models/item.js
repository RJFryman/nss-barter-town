'use strict';

module.exports = Item;

var _ = require('lodash');
var Mongo = require('mongodb');
var items = global.nss.db.collection('items');
var fs = require('fs');

function Item(data){
  this.name = data.name;
  this.year = parseInt(data.year);
  this.description = data.description;
  this.photos = [];
  this.cost = parseInt(data.cost);
  this.tags = data.tags.split(',').map(function(tag){return tag.trim();});
  this.tags = _.compact(this.tags);
  this.offered = false;
  this.userId = Mongo.ObjectID(data.userId);
  this.offers = [];
}

Item.prototype.insert = function(fn){
  items.insert(this, function(err, record){
    fn(err);
  });
};

Item.prototype.mkDir = function(fn){
  var dirname = this._id.toString();
  var abspath = __dirname + '/../static';
  var relpath = '/img/items/' + dirname;
  fs.mkdirSync(abspath + relpath);
  this.photoPath = relpath;
  fn();
};

Item.prototype.addPhoto = function(oldPath, filename, fn){
  var self = this;
  var abspath = __dirname + '/../static';
  var relpath = '/img/items/'+ this._id.toString() + '/' + filename;

  fs.rename(oldPath, abspath + relpath, function(err){
    self.photos.push(relpath);
    fn();
  });
};

Item.prototype.update = function(fn){
  items.update({_id:this._id}, this, function(err, count){
    fn(count);
  });
};


Item.prototype.toggleOffered = function(){
  if (this.offered === true){
    this.offered = false;
  }else{
    this.offered = true;
  }
};

Item.prototype.addOffer = function(id){
  var offerId = Mongo.ObjectID(id);
  this.offers.push(offerId);
};

Item.findAll = function(fn){
  items.find().toArray(function(err, records){
    fn(records);
  });
};

Item.findById = function(id, fn){
  var _id = Mongo.ObjectID(id);

  items.findOne({_id:_id}, function(err, record){
    fn(_.extend(record, Item.prototype));
  });
};

Item.findByUserId = function(userId, fn){
  userId = Mongo.ObjectID(userId);

  items.find({userId:userId}).toArray(function(err, records){
    fn(records);
  });
};

Item.prototype.removeOffer = function(itemId){
  var id = Mongo.ObjectID(itemId);
  _.remove(this.offers, function(item){
    return item === id;
  });
};

Item.deleteById = function(id, fn){
  var _id = Mongo.ObjectID(id);

  items.remove({_id:_id}, function(err, count){
    fn(count);
  });
};

/*
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
*/

/*
Item.findBytags = function(tag, fn){
  items.find({tags:tag}, function(err, records){
    fn(records);
  });
};
*/
