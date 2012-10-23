var fixtures = require('./support/fixtures'),
    should = require('should');

describe('Page', function() {
  var Page;

  before(function(done) {
    fixtures.Page(function(model) {
      Page = model;
      done();
    });
  });

  describe('constructor', function() {

    it('should setup a db connection', function() {
      var page = new Page();
      should.exist(page._resource);
    });

    it('should set default attributes', function() {
      var page = new Page(),
          attrs = {
            name: '',
            slug: '',
            ctime: '',
            mtime: ''
          };

      page._attributes.should.eql(attrs);
    });

  });

  describe('setter', function() {
    it('should set attributes', function() {
      var page = new Page();
      page.set({'name': 'value'});
      page._attributes.name.should.equal('value');
    });
  });

  describe('getter', function() {
    var page;

    before(function() {
      page = new Page();
      page.set({name: 'test', slug: 'test-slug'});
    });

    it('should get string values', function() {
      page.get('name').should.equal('test');
    });

    it('should get an array of values', function() {
      var val = page.get(['name', 'slug']);
      val['name'].should.equal('test');
      val['slug'].should.equal('test-slug');
    });
  });
});