var Emitter = require('emitter')
  , XRegExp = require('xregexp').XRegExp
  , exec = XRegExp.exec
  , Promise = require('laissez-faire')
  , series = require('async-forEach').series
  , equal = require('equals').object
  , join = require('path').join
  , split = require('path').split

exports = module.exports = State

/**
 * Create an object to represent a specific location within an app
 * @api private
 */
function State () {
	Emitter.call(this)
	this.children = []
}

/*!
 * Inherit from emitter
 */
var proto = State.prototype = Object.create(Emitter.prototype)
proto.constructor = State

/*!
 * Default values
 */
proto.activeChild = null
proto._regex = /.*/i
proto.running = false

proto.child = function (path) {
	return this.get(path, true)
}

/**
 * Fetch a child state if it exists
 * 
 * @param {String} path to the target state
 * @param {Boolean} [force] create the state if it doesn't yet exist
 * @return {State}
 */

proto.get = function(path, force) {
	if (typeof path === 'string') path = split(path)

	var direction = compile(path[0])
	  , child = this.children[direction]

	if (!child) {
		if (!force) return
		child = new State
		child._regex = direction
		this.connect(child, direction)
	}

	if (path.length > 1)
		return child.get(path.slice(1), force)
	else
		return child
}

/**
 * Make a state a child of the context state
 *
 * @param {State} state
 * @param {String|RegExp} regexp
 */

proto.connect = function (state, regexp) {
	state.parent = this
	this.children.push(state)
	this.children[regexp] = state
}

/**
 * Convert a path segment to a regexp
 *
 * @param {String} path
 * @return {XRegExp} an extended regexp
 * @api private
 */

exports.compile = compile
function compile (path) {
	path = path
		.replace(/:(\w+):?/g, '(?<$1>\\w+)')
		.replace(/\*/g, '(\\w+)')
	return XRegExp('^'+path+'$', 'i')
}

/**
 * Run a path against the state in order to see if it will match
 *
 * @param {String} path
 * @return {Array} matching parameters
 */

proto.test = function (path) {
	return exec(path, this._regex)
}

/**
 * Activate a child state. Any currently active states which are not within the 
 * new path will be deactivated
 *
 * @param {String} path, to the desired child states
 * @return {Promise} for when all operation are complete
 */

proto.navigate = function (path) {
	var start = location.pathname
	if (join(start) === join(this.params.path, path)) return Promise.fulfilled()
	pushState(start)

	// This is a special case. There should be a better way
	if (!path || path === '/') {
		path = this.params.path
		var self = this
		return this.closeChildren().then(function () {
			replaceState(path)
			return self.emit('at')
		})
	}

	return navigate(this, split(path))
}

function navigate (state, path) {
	var children = state.children
	  , direction = path[0]

	for (var i = 0, len = children.length; i < len; i++) {
		var child = children[i]
		  , params = child.test(direction)

		if (params) {
			params.path = join(state.params.path, direction)
			replaceState(params.path)
			if (child.isActive(params)) {
				if (path.length > 1) return navigate(child, path.slice(1))
				return child.closeChildren()
			}
			return state.closeChildren().then(function () {
				state.activeChild = child
				return child.activate(params).then(function () {
					if (path.length > 1) return navigate(child, path.slice(1))
					return child.emit('at')
				})
			})
		}
	}
	return Promise.fulfilled()
}

/**
 * Checks if the new state matches the old
 *
 * @param {Array} params
 * @return {Boolean}
 */

proto.isActive = function (params) {
	if (!this.params) return false
	return equal(this.params, params)
}

/**
 * Close all open states at or below the context state
 *
 * @param {Function} callback, when done
 * @return {Promise} for when all operations have completed
 */

proto.closeChildren = function (callback) {
	var active = []
	  , state = this
	  , promise = new Promise

	while (state = state.activeChild) {
		active.push(state)
	}

	this.activeChild = null

	series(active, function (item, done) {
		item.emit('before close').nend(done)
	}, function (err) {
		series(active.reverse(), function (item, done) {
			item.deactivate().nend(done)
		}, function (e) {
			if (e) promise.reject(e)
			else promise.resolve()
		})
	})

	return promise
}

/**
 * Switch to an active state
 *
 * @param {Array} params, a list of params. Named params should also be attatched
 * @return {Promise} for when all activation handlers have completed
 */

proto.activate = function (params) {
	this.params = params
	return this.emit('open')
}

/*!
 * Add an entry to the browers history
 */
function pushState (path) {
	history.pushState(null, '', path)
}

/*!
 * Replace the latest history entry with a new one
 */
function replaceState (path) {
	history.replaceState(null, '', path)
}

/**
 * Transition to an inactive state
 *
 * @return {Promise} for when the handlers have completed
 */

proto.deactivate = function () {
	var self = this
	return this.emit('close').end(function () {
		self.params = null
		self.activeChild = null
	})
}

/**
 * Emit an event and sequencially process all handlers async or sync
 *
 * @param {String} type, of event
 * @param {Any} data, to pass to each handler
 * @return {Promise} for when all handlers are complete
 */

proto.emit = function (type) {
	var promise = new Promise
	  , handlers = this._callbacks[type]
	  , self = this

	if (!handlers) handlers = []

	series(handlers, function (fn, done) {
		if (fn.length) fn.call(self, done)
		else fn.call(self), done()
	}, function (err) {
		if (err) promise.reject(err)
		else promise.resolve()
	})

	return promise
}

/**
 * Add 'enter' handlers to a child state. If the child does not currently exist 
 * it will be created. Pass as many or as few handlers as you like.
 *
 * @param {String} path relative to the context state
 * @param {Function} [...]
 * @return {State} the child state
 */

;['at', 'open', 'close'].forEach(function (method) {
	proto[method] = function (path) {
		return $on(this, path, method, arguments)
	}
})

function $on (child, path, type, args) {
	child = child.get(path, true)
	for (var i = 1, len = args.length; i < len; i++) {
		child.on(type, args[i])
	}
	return child
}

/**
 * Turn on the router so it will start monitoring the state of the app
 * If you don't pass a base path. '/' will be used
 *
 * @param {String} path the base path
 */

exports.start = function (path) {
	if (exports.running) return
	exports.running = true
	window.addEventListener('click', onClick)
	window.addEventListener('popstate', onPopstate)

	if (path != null) 
		return navigate(exports.top, split(path))
}

/*!
 * popstate fires when the back button is clicked
 */

function onPopstate (e) {
	exports.top.navigate(location.pathname + location.search)
}

/*!
 * If the click occurred within a link the navigation needs to be handled by the router
 */

function onClick (e) {
	if (e.defaultPrevented) return
	var target = e.target
	do {
		if (target.nodeName === 'A') {
			if (sameOrigin(target.href)) {
				e.preventDefault()
				exports.top.navigate(target.pathname + target.search)
			}
			break
		}
	} while (target = target.parentElement)
}

/**
 * Turn off the router so it no longer tracks state or emits events
 */

exports.stop = function () {
	if (!exports.running) return
	exports.running = false
	window.removeEventListener('click', onClick)
	window.removeEventListener('popstate', onPopstate)
}

/*!
 * Create the top level instance to be used as the head of the tree
 */

exports.top = new State
exports.top.params = []
// The top level node is always the same
exports.top.params.path = '/'

/**
 * Test if a link is within the current domain
 *
 * @param {String} href
 * @return {Boolean}
 * @api private
 */

function sameOrigin (href) {
	var origin = location.protocol + '//' + location.hostname
	if (location.port)
		origin += ':' + location.port
	return href.indexOf(origin) === 0
}
