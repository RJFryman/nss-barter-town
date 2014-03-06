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
