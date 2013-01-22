/**
 * Rose always bases itself around the root of the path. If you app lives
 * on a sub path such as this example you must create that relative to the 
 * top. From then on you can prentend your app is running at the top level.
 */

var app = Rose.top.child('/example/simple')

var content = document.getElementById('content')

app.at('rose', function () {
	content.innerHTML = ':-)'
})

app.at('others', function () {
	content.innerHTML = ':-('
})

Rose.start('/example/simple/rose')
