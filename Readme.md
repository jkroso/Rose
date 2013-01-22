# Rose

Client side routing is a very different thing from server side. A server side routers job is basically to interpret a message and map it to an action. A client side router does the same except all messages it uses are visible to the user. Therefore, they need to be designed to be understood easily by both the user. Users should be able to view their URL as a bookmark of where they are in your app. Like a street address this should have a __hierarchical__ structure with each successive node describing something __within__ its parent. Assuming you agree with this idea Rose makes it easy to model the __high level__ state of your app. With Rose you break down your app into chunks and represent each with an object and a URL __segment__ pattern (the chunks user facing name). If you like you can then break any of these chunks down further and so on. Effectively Rose is the place where you describe your app.  

Rose makes it easy to pull things together since each _chunk_ is declined the opportunity to know much about the world around. So there isn't much that can go wrong when you move them. With a solid story for putting things back together you can focus on pulling things apart into smaller pieces. Which makes testing easier and reuse between apps more likely. Rose is a particularly good fit for web apps using the DOM since they both encourage similar modes of thinking.

## Getting Started

With component(1) 

`component install jkroso/rose --save`

In Node.js 

`npm install jkroso/rose --save`

## Basic Usage

```javascript
// example here
```

## API

```javascript
var rose = require('rose')
```
  - [State.get()](#stategetpathstringforceboolean)
  - [State.connect()](#stateconnectstatestateregexpstringregexp)
  - [State.test()](#statetestpathstring)
  - [State.navigate()](#statenavigatepathstring)
  - [State.isActive()](#stateisactiveparamsarray)
  - [State.closeChildren()](#stateclosechildrencallbackfunction)
  - [State.activate()](#stateactivateparamsarray)
  - [State.deactivate()](#statedeactivate)
  - [State.emit()](#stateemittypestringdataany)
  - [exports.start()](#exportsstartpathstring)
  - [exports.stop()](#exportsstop)

## State.get(path:String, [force]:Boolean)

  Fetch a child state if it exists

## State.connect(state:State, regexp:String|RegExp)

  Make a state a child of the context state

## State.test(path:String)

  Run a path against the state in order to see if it will match

## State.navigate(path,:String)

  Activate a child state. Any currently active states which are not within the 
  new path will be deactivated

## State.isActive(params:Array)

  Checks if the new state matches the old

## State.closeChildren(callback,:Function)

  Close all open states at or below the context state

## State.activate(params,:Array)

  Switch to an active state

## State.deactivate()

  Transition to an inactive state

## State.emit(type,:String, data,:Any)

  Emit an event and sequencially process all handlers async or sync

## exports.start(path:String)

  Turn on the router so it will start monitoring the state of the app
  If you don't pass a base path. '/' will be used

## exports.stop()

  Turn off the router so it no longer tracks state or emits events

## Contributing
As with all my work this is both a work in progress and a thought in progress. Feel free to chip in in any way you can.

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Jakeb Rosoman

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
