'use strict';

module.exports = Item;

var _ = require('lodash');
var Mongo = require('mongodb');
var items = global.nss.db.collection('items');
var fs = require('fs');
var User = require('./user');
var request = require('request');
var jade = require('jade');

function Item(data){
  this.name = data.name;
  this.year = parseInt(data.year);
  this.description = data.description;
  this.photos = [];
  this.cost = data.cost.replace(/[^0-9.]/g,'');
  this.cost = parseInt(this.cost);
  this.tags = data.tags.split(',').map(function(tag){return tag.trim();});
  this.tags = _.compact(this.tags);
  this.offered = false;
  this.userId = Mongo.ObjectID(data.userId);
  this.offers = [];
  this.category = data.category;
}

Item.find = function(query, fn){
  var limit = query.limit || 10;
  var skip = query.page ? (query.page - 1) * limit : 0;
  var filter = {};
  var sort = [];

  if(query.filterName === 'userId'){
    query.filterValue = Mongo.ObjectID(query.filterValue);
  }else if(query.filterName === 'year'){
    query.filterValue = parseInt(query.filterValue);
  }else if(query.filterName === 'description'){
    query.filterValue = new RegExp(query.filterValue);
  }else if(query.filterName === 'name'){
    query.filterValue = new RegExp(query.filterValue);
  }

  filter[query.filterName] = query.filterValue;

  if(query.sort){
    var direction = query.direction ? query.direction * 1 : 1;
    sort.push([query.sort, direction]);
  }

  items.find(filter, {sort:sort, skip:skip, limit:limit}).toArray(function(err, records){
    fn(records);
  });
};

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
  if(self.photos.length < 5){
    var abspath = __dirname + '/../static';
    var relpath = '/img/items/'+ this._id.toString() + '/' + filename;

    fs.rename(oldPath, abspath + relpath, function(err){
      self.photos.push(relpath);
      fn();
    });
  }else{
    fn('Photo limit is 5');
  }
};


//note tested
Item.prototype.removePhoto = function(path, fn){
  var removed = _.remove(this.photos, function(photo){
    return photo === path;
  });
  fn(removed);
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

Item.findByCategory = function(category, fn){
  items.find({category:category}).toArray(function(err, records){
    fn(records);
  });
};

Item.findByUserId = function(userId, fn){
  userId = Mongo.ObjectID(userId);

  items.find({userId:userId}).toArray(function(err, records){
    fn(records);
  });
};

Item.findByTag = function(tag, fn){
  items.find({tags:tag}).toArray(function(err, records){
    fn(records);
  });
};

Item.prototype.removeOffer = function(itemId){
  _.remove(this.offers, function(item){
    return item.toString() === itemId;
  });
};

Item.deleteById = function(id, fn){
  var _id = Mongo.ObjectID(id);

  items.remove({_id:_id}, function(err, count){
    fn(count);
  });
};

Item.prototype.sendAcceptEmail = function(tradedItemName, fn){
  var self = this;
  User.findById(this.userId.toString(), function(foundUser){
    // Load actual template text
    var template = fs.readFileSync(__dirname + '/../static/emails/template.jade', 'utf8');
    var content = fs.readFileSync(__dirname + '/../static/emails/accept.jade', 'utf8');

    // Compile template rendering function
    template = jade.compile(template, { pretty: true, filename: __dirname + '/../static/emails/template.jade' });
    content = jade.compile(content, { pretty: true, filename: __dirname + '/../static/emails/accept.jade' });

    // Render jade template, passing in the info
    var output = content({ body: template(), item:self, name:foundUser.name, tradedItemName:tradedItemName });
    var key = process.env.MAILGUN;
    var url = 'https://api:' + key + '@api.mailgun.net/v2/sandbox46639.mailgun.org/messages';
    var post = request.post(url, function(err, response, body){
      fn();
    });
    var form = post.form();
    form.append('from', 'robert.fryman@gmail.com');
    form.append('to', foundUser.email);
    form.append('subject', 'You have successfully traded!');
    form.append('html', output);
  });
};

Item.deleteAllByUserId = function(userId, fn){
  userId = Mongo.ObjectID(userId);
  items.remove({userId:userId}, function(err, count){
    fn(count);
  });
};
