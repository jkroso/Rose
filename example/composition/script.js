var app = Rose.top.child('/example/composition')
var color

app.open('one', flash)
app.open('one/two', flash)
app.open('one/two/three', flash)

app.close('one', flash)
app.close('one/two', flash)
app.close('one/two/three', flash)

app.at('one/two/three', function () {
	color = 'rgb(150,0,20)'
})
app.on('at', function () {
	color = 'rgb(0,150,20)'
})

function flash (done) {
	var div = document.getElementById(this.params[0])
	div.style.background = color
	setTimeout(function () {
		div.style.background = ''
		done()
	}, 600)
}

Rose.start('/example/composition')

/**
 * Provided a node is currently active you can call navigate directly on
 * it. When you do this you can leave of any leading path segments.
 */

function loop () {
	app.navigate('one/two/three').then(function () {
		app.navigate('/').then(loop)
	})
}

loop()