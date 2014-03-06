/* jshint expr:true */

'use strict';

process.env.DBNAME = 'bartertown-test';
var expect = require('chai').expect;
var User, Item, u1;
var fs = require('fs');
var exec = require('child_process').exec;
var Mongo = require('mongodb');

describe('User', function(){

  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      User = require('../../app/models/user');
      Item = require('../../app/models/item');
      done();
    });
  });

  beforeEach(function(done){
    var testdir = __dirname + '/../../app/static/img/users/test*';
    var cmd = 'rm ' + testdir;

    exec(cmd, function(){
      var origfile = __dirname + '/../fixtures/testfile.jpg';
      var copyfile = __dirname + '/../fixtures/testfile-copy.jpg';
      fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile));
      global.nss.db.dropDatabase(function(err, result){
        u1 = new User({name:'Adam Thede', email:'adam@adam.com', password:'1234'});
        u1.hashPassword(function(){
          u1.insert(function(){
            done();
          });
        });
      });
    });
  });

  describe('new', function(){
    it('should create a new Item object', function(){
      var i1 = new Item({name:'car', year:'1969', description:'blue', cost:'1000', tags:'nice', userId:u1._id.toString()});
      expect(i1).to.be.instanceof(Item);
      expect(i1.name).to.equal('car');
      expect(i1.year).to.equal(1969);
      expect(i1.description).to.equal('blue');
      expect(i1.cost).to.equal(1000);
      expect(i1.tags).to.deep.equal(['nice']);
      expect(i1.userId).to.deep.equal(u1._id);
      expect(i1.userId).to.be.instanceof(Mongo.ObjectID);
    });
  });
});
