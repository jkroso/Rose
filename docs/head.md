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
