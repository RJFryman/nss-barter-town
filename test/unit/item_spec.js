/* jshint expr:true */

'use strict';

process.env.DBNAME = 'bartertown-test';
var expect = require('chai').expect;
var User, Item, u1, u2, u3;
var fs = require('fs');
var exec = require('child_process').exec;
var Mongo = require('mongodb');

describe('Item', function(){

  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      User = require('../../app/models/user');
      Item = require('../../app/models/item');
      done();
    });
  });

  beforeEach(function(done){
    var testdir = __dirname + '/../../app/static/img/items/*';
    var cmd = 'rm -rf ' + testdir;

    exec(cmd, function(){
      var origfile = __dirname + '/../fixtures/testfile.jpg';
      var copyfile = __dirname + '/../fixtures/testfile-copy.jpg';
      var copyfile1 = __dirname + '/../fixtures/testfile-copy1.jpg';
      fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile));
      fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile1));
      global.nss.db.dropDatabase(function(err, result){
        u1 = new User({name:'Adam Thede', email:'adam@adam.com', password:'1234'});
        u2 = new User({name:'Robert Fryman', email:'robert.fryman@gmail.com', password:'4567'});
        u3 = new User({name:'Nat Webb', email:'nat@nat.com', password:'abcd'});
        u1.hashPassword(function(){
          u2.hashPassword(function(){
            u3.hashPassword(function(){
              u1.insert(function(){
                u2.insert(function(){
                  u3.insert(function(){
                    done();
                  });
                });
              });
            });
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

  describe('#insert', function(){
    it('should insert a new item in the db', function(done){
      var i1 = new Item({name:'car', year:'1969', description:'blue', cost:'1000', tags:'nice', userId:u1._id.toString()});
      i1.insert(function(){
        expect(i1._id.toString()).to.have.length(24);
        done();
      });
    });
  });

  describe('#mkDir', function(){
    it('should make an item directory in the file system', function(done){
      var pathName = '/img/items/';
      var i1 = new Item({name:'car', year:'1969', description:'blue', cost:'1000', tags:'nice', userId:u1._id.toString()});
      i1.insert(function(){
        var id = i1._id.toString();
        i1.mkDir(function(){
          expect(i1.photoPath).to.equal(pathName + id);
          done();
        });
      });
    });
  });

  describe('#addPhoto', function(){
    it('should add a photo to the item directory and put its path into the photos directory', function(done){
      var oldPath = __dirname + '/../fixtures/testfile-copy.jpg';
      var i1 = new Item({name:'car', year:'1969', description:'blue', cost:'1000', tags:'nice', userId:u1._id.toString()});
      i1.insert(function(){
        i1.mkDir(function(){
          i1.addPhoto(oldPath, 'itempic.jpg', function(){
            expect(i1.photos).to.have.length(1);
            expect(i1.photos[0]).to.equal('/img/items/'+i1._id.toString()+'/itempic.jpg');
            done();
          });
        });
      });
    });
  });

  describe('#update', function(){
    it('should update an item in the db', function(done){
      var oldPath = __dirname + '/../fixtures/testfile-copy.jpg';
      var oldPath1 = __dirname + '/../fixtures/testfile-copy1.jpg';
      var i1 = new Item({name:'car', year:'1969', description:'blue', cost:'1000', tags:'nice', userId:u1._id.toString()});
      i1.insert(function(){
        i1.mkDir(function(){
          i1.addPhoto(oldPath, 'testfile-copy.jpg', function(){
            i1.addPhoto(oldPath1, 'testfile-copy1.jpg', function(){
              i1.name = 'My Buick';
              i1.year = 1938;
              i1.cost = 20000;
              i1.update(function(count){
                expect(count).to.equal(1);
                expect(i1.name).to.equal('My Buick');
                expect(i1.year).to.equal(1938);
                expect(i1.cost).to.equal(20000);
                expect(i1.description).to.equal('blue');
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('#addOffer', function(){
    it('should add an item\'s _id to the offers array and change the state of the item receiving the offer', function(done){
      var oldPath = __dirname + '/../fixtures/testfile-copy.jpg';
      var oldPath1 = __dirname + '/../fixtures/testfile-copy1.jpg';
      var i1 = new Item({name:'car', year:'1969', description:'blue', cost:'1000', tags:'nice', userId:u1._id.toString()});
      var i2 = new Item({name:'couch', year:'1983', description:'brown', cost:'100', tags:'stained, springy', userId:u1._id.toString()});
      i1.insert(function(){
        i1.mkDir(function(){
          i1.addPhoto(oldPath, 'testfile-copy.jpg', function(){
            i2.insert(function(){
              i2.mkDir(function(){
                i2.addPhoto(oldPath1, 'testfile-copy1.jpg', function(){
                  i1.addOffer(i2._id.toString());
                  expect(i1.offers).to.have.length(1);
                  expect(i1.offers[0]).to.deep.equal(i2._id);
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  describe('#toggleOffered', function(){
    it('should toggle the offer state on an item', function(done){
      var oldPath = __dirname + '/../fixtures/testfile-copy.jpg';
      var oldPath1 = __dirname + '/../fixtures/testfile-copy1.jpg';
      var i1 = new Item({name:'car', year:'1969', description:'blue', cost:'1000', tags:'nice', userId:u1._id.toString()});
      var i2 = new Item({name:'couch', year:'1983', description:'brown', cost:'100', tags:'stained, springy', userId:u1._id.toString()});
      i1.insert(function(){
        i1.mkDir(function(){
          i1.addPhoto(oldPath, 'testfile-copy.jpg', function(){
            i2.insert(function(){
              i2.mkDir(function(){
                i2.addPhoto(oldPath1, 'testfile-copy1.jpg', function(){
                  i1.addOffer(i2._id.toString());
                  i2.toggleOffered();
                  expect(i2.offered).to.be.true;
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  describe('.findById', function(){
    it('should find an item by id in the db', function(done){
      var i1 = new Item({name:'car', year:'1969', description:'blue', cost:'1000', tags:'nice', userId:u1._id.toString()});
      var i2 = new Item({name:'couch', year:'1983', description:'brown', cost:'100', tags:'stained, springy', userId:u1._id.toString()});
      i1.insert(function(){
        i2.insert(function(){
          var id = i2._id.toString();
          Item.findById(id, function(record){
            expect(record._id.toString()).to.equal(id);
            done();
          });
        });
      });
    });
  });

  describe('.deleteById', function(){
    it('should find and delete item by id', function(done){
      var i1 = new Item({name:'car', year:'1969', description:'blue', cost:'1000', tags:'nice', userId:u1._id.toString()});
      var i2 = new Item({name:'couch', year:'1983', description:'brown', cost:'100', tags:'stained, springy', userId:u1._id.toString()});
      i1.insert(function(){
        i2.insert(function(){
          var id = i2._id.toString();
          Item.deleteById(id, function(count){
            expect(count).to.equal(1);
            done();
          });
        });
      });
    });
  });

  describe('.findAll', function(){
    it('should return all the items', function(done){
      var i1 = new Item({name:'car', year:'1969', description:'blue', cost:'1000', tags:'nice', userId:u1._id.toString()});
      var i2 = new Item({name:'couch', year:'1983', description:'brown', cost:'100', tags:'stained, springy', userId:u1._id.toString()});
      i1.insert(function(){
        i2.insert(function(){
          Item.findAll(function(records){
            expect(records).to.have.length(2);
            done();
          });
        });
      });
    });
  });

  describe('.findByUserId', function(){
    it('should find an array of items by userId', function(done){
      var i1 = new Item({name:'car', year:'1969', description:'blue', cost:'1000', tags:'nice', userId:u1._id.toString()});
      var i2 = new Item({name:'couch', year:'1983', description:'brown', cost:'100', tags:'stained, springy', userId:u1._id.toString()});
      var i3 = new Item({name:'box', year:'1912', description:'brown', cost:'1', tags:'stained, useful', userId:u2._id.toString()});
      i1.insert(function(){
        i2.insert(function(){
          i3.insert(function(){
            Item.findByUserId(u1._id.toString(), function(items){
              expect(items.length).to.equal(2);
              expect(items[0]._id.toString()).to.have.length(24);
              done();
            });
          });
        });
      });
    });
  });

  describe('.findByCategory', function(){
    it('should find an array of items by category', function(done){
      var i1 = new Item({name:'car', category:'car', year:'1969', description:'blue', cost:'1000', tags:'nice', userId:u1._id.toString()});
      var i2 = new Item({name:'couch', category:'car', year:'1983', description:'brown', cost:'100', tags:'stained, springy', userId:u1._id.toString()});
      var i3 = new Item({name:'box', category:'not car', year:'1912', description:'brown', cost:'1', tags:'stained, useful', userId:u2._id.toString()});
      i1.insert(function(){
        i2.insert(function(){
          i3.insert(function(){
            Item.findByCategory(i1.category, function(items){
              expect(items.length).to.equal(2);
              expect(items[0]._id.toString()).to.have.length(24);
              done();
            });
          });
        });
      });
    });
  });

  describe('.findByTag', function(){
    it('should find an array of items by tag', function(done){
      var i1 = new Item({name:'car', category:'car', year:'1969', description:'blue', cost:'1000', tags:'nice', userId:u1._id.toString()});
      var i2 = new Item({name:'couch', category:'car', year:'1983', description:'brown', cost:'100', tags:'stained, springy', userId:u1._id.toString()});
      var i3 = new Item({name:'box', category:'not car', year:'1912', description:'brown', cost:'1', tags:'stained, useful', userId:u2._id.toString()});
      i1.insert(function(){
        i2.insert(function(){
          i3.insert(function(){
            Item.findByTag(i2.tags[0], function(items){
              expect(items.length).to.equal(2);
              expect(items[0]._id.toString()).to.have.length(24);
              done();
            });
          });
        });
      });
    });
  });

  describe('.removeOffer', function(){
    it('should remove an offer from the offers array', function(done){
      var i1 = new Item({name:'car', year:'1969', description:'blue', cost:'1000', tags:'nice', userId:u1._id.toString()});
      var i2 = new Item({name:'couch', year:'1983', description:'brown', cost:'100', tags:'stained, springy', userId:u1._id.toString()});
      var i3 = new Item({name:'box', year:'1912', description:'brown', cost:'1', tags:'stained, useful', userId:u2._id.toString()});
      i1.insert(function(){
        i2.insert(function(){
          i3.insert(function(){
            i1.addOffer(i2._id.toString());
            i1.addOffer(i3._id.toString());
            expect(i1.offers.length).to.equal(2);
            expect(i1.offers[0]).to.be.instanceof(Mongo.ObjectID);
            done();
          });
        });
      });
    });
  });

  describe('.deleteAllByUserId', function(){
    it('should delete multiple items', function(done){
      var i1 = new Item({name:'car', category:'car', year:'1969', description:'blue', cost:'1000', tags:'nice', userId:u1._id.toString()});
      var i2 = new Item({name:'couch', category:'car', year:'1983', description:'brown', cost:'100', tags:'stained, springy', userId:u1._id.toString()});
      var i3 = new Item({name:'box', category:'not car', year:'1912', description:'brown', cost:'1', tags:'stained, useful', userId:u2._id.toString()});
      i1.insert(function(){
        i2.insert(function(){
          i3.insert(function(){
            Item.deleteAllByUserId(u1._id.toString(), function(count){
              expect(count).to.equal(2);
              done();
            });
          });
        });
      });
    });
  });

  describe('.find', function(){
    beforeEach(function(done){
      global.nss.db.dropDatabase(function(err, result){
        var u1id = u1._id.toString();
        var u2id = u2._id.toString();
        var u3id = u3._id.toString();


        var i1 ={name:'mustang', year:'1969', photos:['1','2'], description:'fast', cost:'1500', tags:'fast,like-new,a', userId:u1id, category:'car'};
        var i2 ={name:'couch', year:'1989', description:'testing to see if you find fast', photos:['1'], cost:'100', tags:'fast, super,cool', userId:u1id, category:'funiture'};
        var i3 ={name:'nameless car', photos:['1'], year:'1990', cost:'50', tags:'great,super,a', userId:u1id, category:'car'};
        var i4 ={name:'stuff', year:'2010', cost:'1000', tags:'look,a', userId:u2id, category:'stuff'};
        var i5 ={name:'things', year:'2000', cost:'500', tags:'at,all,a', userId:u2id, category:'stuff'};
        var i6 ={name:'crap', year:'1998', cost:'400', tags:'there,a', userId:u1id, category:'car'};
        var i7 ={name:'stuff', year:'2004', cost:'350', tags:'great', userId:u3id, categoty:'computers'};
        var i8 ={name:'more crap', year:'1999', cost:'400', tags:'tags', userId:u3id, category:'crap'};
        var i9 ={name:'super cool stuff', description:'super fast', year:'2010', cost:'200', tags:'should,i', userId:u1id, category:'free'};
        var ia ={name:'stuff', year:'2000', cost:'700', tags:'get,programers', userId:u1id, category:'come'};
        var ib ={name:'money', year:'1990', cost:'100', tags:'Dvorak', userId:u1id, category:'get'};
        var ic ={name:'apple', year:'1999', description:'slow', cost:'200', tags:'might', userId:u1id, category:'me'};
        var id ={name:'tesy', year:'2000', cost:'350', tags:'help', userId:u2id, category:'mother'};
        var ie ={name:'thing', year:'2014', cost:'500', tags:'', userId:u2id, category:'truckers'};
        (new Item(i1)).insert(function(){
          (new Item(i2)).insert(function(){
            (new Item(i3)).insert(function(){
              (new Item(i4)).insert(function(){
                (new Item(i5)).insert(function(){
                  (new Item(i6)).insert(function(){
                    (new Item(i7)).insert(function(){
                      (new Item(i8)).insert(function(){
                        (new Item(i9)).insert(function(){
                          (new Item(ia)).insert(function(){
                            (new Item(ib)).insert(function(){
                              (new Item(ic)).insert(function(){
                                (new Item(id)).insert(function(){
                                  (new Item(ie)).insert(function(){
                                    done();
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
    it('should find all taks - page 1,10 per page', function(done){
      var query = {};

      Item.find(query, function(items){
        expect(items).to.have.length(10);
        done();
      });
    });
    it('should find all task - page 1, 7 per page', function(done){
      var query = {limit:'7'};

      Item.find(query, function(items){
        expect(items).to.have.length(7);
        done();
      });
    });
    it('should find all task - page 1, 12 per page', function(done){
      var query = {limit:'12'};

      Item.find(query, function(items){
        expect(items).to.have.length(12);
        done();
      });
    });
    it('should find all task page 2 4 task remaining', function(done){
      var query = {page:'2'};

      Item.find(query, function(items){
        expect(items).to.have.length(4);
        done();
      });
    });
    it('should find all task page 2 with 5 limit', function(done){
      var query = {limit:'5', page:'2'};

      Item.find(query, function(items){
        expect(items).to.have.length(5);
        expect(items[0].name).to.equal('crap');
        done();
      });
    });
    it('should filer all tasks by tags', function(done){
      var query = {filterName:'tags', filterValue:'fast'};

      Item.find(query, function(items){
        expect(items).to.have.length(2);
        done();
      });
    });
    it('should filter all tasks by year', function(done){
      var query = {filterName:'year', filterValue:'2000'};

      Item.find(query, function(items){
        expect(items).to.have.length(3);
        done();
      });
    });
    it('should filter all tasks by userId', function(done){
      var id = u1._id.toString();
      var query = {filterName:'userId', filterValue:id};

      Item.find(query, function(items){
        expect(items).to.have.length(8);
        done();
      });
    });
    it('should filter all tasks by category', function(done){
      var query = {filterName:'category', filterValue:'car'};

      Item.find(query, function(items){
        expect(items).to.have.length(3);
        done();
      });
    });
    it('should filter by name', function(done){
      var query = {filterName:'name', filterValue:'stuff'};

      Item.find(query, function(items){
        expect(items).to.have.length(4);
        done();
      });
    });
    it('should filter by has description', function(done){
      var query = {filterName:'description', filterValue:'fast'};

      Item.find(query, function(items){
        expect(items).to.have.length(3);
        done();
      });
    });
    it('should sort all name', function(done){
      var query = {sort:'name'};

      Item.find(query, function(items){
        expect(items).to.have.length(10);
        expect(items[0].name).to.equal('apple');
        done();
      });
    });
    it('should sort all name', function(done){
      var query = {sort:'year'};

      Item.find(query, function(items){
        expect(items).to.have.length(10);
        expect(items[0].name).to.equal('mustang');
        done();
      });
    });
    it('should sort all name', function(done){
      var query = {sort:'year', direction:'-1'};

      Item.find(query, function(items){
        expect(items).to.have.length(10);
        expect(items[0].name).to.equal('thing');
        done();
      });
    });
    it('should sort all cost', function(done){
      var query = {sort:'cost'};

      Item.find(query, function(items){
        expect(items).to.have.length(10);
        expect(items[0].name).to.equal('nameless car');
        done();
      });
    });
    it('should sort all cost', function(done){
      var query = {sort:'cost', direction:'-1'};

      Item.find(query, function(items){
        expect(items).to.have.length(10);
        expect(items[0].name).to.equal('mustang');
        done();
      });
    });
    it('should sort all category', function(done){
      var query = {sort:'category'};

      Item.find(query, function(items){
        expect(items).to.have.length(10);
        expect(items[0].name).to.equal('stuff');
        done();
      });
    });
    it('should sort all category', function(done){
      var query = {sort:'category', direction:'-1'};

      Item.find(query, function(items){
        expect(items).to.have.length(10);
        expect(items[0].name).to.equal('thing');
        done();
      });
    });
    it('should filter and sort all the things', function(done){
      var query = {page:'2', limit:'2', filterName:'tags', filterValue:'a', sort:'cost', direction:'1'};

      Item.find(query, function(items){
        expect(items).to.have.length(2);
        expect(items[0].name).to.equal('things');
        done();
      });
    });
    /*
    it('should filter by has photo', function(done){
      var query = {filterName:'photos'};

      Item.find(query, function(items){
        expect(items).to.have.length(3);
        done();
      });
    });
    */


  });
});
