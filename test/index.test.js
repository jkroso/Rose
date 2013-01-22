var should = require('chai').should()
  , Rose = require('../src')
  , compile = Rose.compile
  , XRegExp = require('xregexp').XRegExp
  , exec = XRegExp.exec

var app

beforeEach(function () {
	Rose.top && Rose.stop()
	app = Rose.top = new Rose
	app.params = []
	Rose.start()
})

describe('compile', function () {
	it('should return a regexp', function () {
		compile('a').should.be.an.instanceOf(RegExp)
	})

	it('should never be sensitive to caseing', function () {
		exec('Title', compile('title')).should.have.property(0, 'Title')
	})

	describe('name portions', function () {
		it('should compile ":name"', function () {
			var r = compile(':name')
			r.toString().should.equal('/^(\\w+)$/i')
			r.exec('jeff').should.be.a('array')
		})

		it('should capture the named variable', function () {
			exec('jeff', compile(':name')).should.have.property('name', 'jeff')
		})

		it('should allow named portions', function () {
			exec('jeffory', compile(':name:ory')).should.have.property('name', 'jeff')
		})

		it('should allow multiple named portions', function () {
			var res = exec('jeffory-bro', compile(':name:ory-:relationship'))
			res.should.have.property('name', 'jeff')
			res.should.have.property('relationship', 'bro')
		})

		it('should index multiple named portions', function () {
			var res = exec('jeffory-bro', compile(':name:ory-:relationship'))
			res.should.have.property('0', 'jeffory-bro')
			res.should.have.property('1', 'jeff')
			res.should.have.property('2', 'bro')
		})
	})

	describe('wildcards', function () {
		it('should capture everything', function () {
			exec('rose_9', compile('*')).should.have.property('1', 'rose_9')
		})
		it('should work with fixed portions', function () {
			var r = exec('rose-isa-star', compile('*-isa-*'))
			r.should.have.property('0', 'rose-isa-star')
			r.should.have.property('1', 'rose')
			r.should.have.property('2', 'star')
		})
		it('should work alongside named portions', function () {
			var r = exec('rose-isa-star', compile('*-isa-:profession'))
			r.should.have.property('0', 'rose-isa-star')
			r.should.have.property('1', 'rose')
			r.should.have.property('2', 'star')
			r.should.have.property('profession', 'star')
		})
	})

	describe('raw regexp', function () {
		it('should name capture while filtering by type', function () {
			var r = exec('album-1', compile('album-(?<number>[0-9]+)'))
			r.should.have.property('0', 'album-1')
			r.should.have.property('1', '1')
			r.should.have.property('number', '1')
		})
	})
})

describe('Rose#get(path, force)', function () {

	beforeEach(function () {
		app = new Rose
	})

	it('if path does not exist it should create a child state', function () {
		var child = app.get('a', true)
		child.should.be.an.instanceOf(Rose)
		child.should.not.equal(app)
	})

	it('should not create a new child if force === false', function () {
		var child = app.get('a')
		should.not.exist(child)
	})

	it('should return the child if it does already exist', function () {
		var child = app.get('a', true)
		app.get('a', true).should.equal(child)
	})
})

describe('Rose#emit(event)', function () {
	it('should call listeners bound to the context State', function (done) {
		app.on('test', function () {
			done()
		})
		app.emit('test')
	})

	it('should return a promise which completes only after all handlers have completed', function (done) {
		var c = 0
		app.on('test', function (done) {
			setTimeout(function () {
				c = 1
				done()
			}, 10)
		})
		app.emit('test').then(function () {
			c.should.equal(1)
			done()
		})
	})
})

describe('.navigate(path)', function () {

	it('Should trigger in correct order', function (done) {
		var c = 0
		app.open('albums', function () {
			(c++).should.be.equal(0)
		})
		app.open('albums/page1', function () {
			(c++).should.be.equal(1)
		})
		app.open('albums/page1/photo5', function () {
			(c++).should.be.equal(2)
		})
		app.navigate('albums/page1/photo5').nend(done)
	})

	it('Should invoke callbacks in the context of the state they are bound on', function (done) {
		var child = app.open('testr/art', function () {
			this.should.be.equal(child)
		})
		app.navigate('testr/art').nend(done)
	})

	it('Should match variable sections', function (done) {
		app.open('albums', function () {
			this.params.should.have.property(0, 'albums')
			this.params.should.have.property('path', '/albums')
		})
		app.open('albums/page:number', function () {
			this.params.should.have.property('path', '/albums/page1')
			this.params.should.have.property('number', '1')
		})
		app.open('albums/page:number/photo:number', function () {
			this.params.should.have.property('number', '5')
			this.params.should.have.property('path', '/albums/page1/photo5')
		})
		app.navigate('albums/page1/photo5').nend(done)
	})

	it('Should set the location to whatever the path was', function (done) {
		app.open('some/random/url', function () {})
		app.navigate('some/random/url').then(function () {
			location.pathname.should.equal('/some/random/url')
		}).nend(done)
	})

	it('should only navigate as far as the app is defined', function (done) {
		app.open('some', function () {})
		app.navigate('some/were/too/far').then(function () {
			location.pathname.should.equal('/some')
		}).nend(done)
	})

	it('should close states below the current target', function (done) {
		var a = app.open('a', function () {})
		var b = app.open('a/b', function () {})
		app.navigate('a/b').then(function () {
			a.isActive({0:'a',index:0, 'input':'a',path:'/a'}).should.be.true
			b.isActive({0:'b',index:0, 'input':'b',path:'/a/b'}).should.be.true
			return app.navigate('a').then(function () {
				a.isActive({0:'a',index:0, 'input':'a',path:'/a'}).should.be.true
				should.not.exist(a.activeChild)
				b.isActive({0:'b',index:0, 'input':'b',path:'/a/b'}).should.be.false
			})
		}).nend(done)
	})	

	afterEach(function () {
		history.pushState(null, document.title, '/test/')
	})

})