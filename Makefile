EXPORT = Rose
SRC = src/*.js
GRAPH = node_modules/.bin/sourcegraph.js src/index.js --plugins=javascript,nodeish
BIGFILE = node_modules/.bin/bigfile -p nodeish --export $(EXPORT)

all: clean dist dist/rose.min.js test Readme.md

browser: dist/rose.min.js.gz dist/rose.js

dist:
	@mkdir dist

dist/rose.min.js.gz: dist/rose.min.js
	@gzip --best -c dist/rose.min.js > dist/rose.min.js.gz

dist/rose.min.js: $(SRC)
	@$(GRAPH) | $(BIGFILE)\
		--production > dist/rose.min.js

dist/rose.js: $(SRC)
	@$(GRAPH) | $(BIGFILE) > dist/rose.js

test:
	@node_modules/.bin/mocha -R spec test/*.test.js

test/built.js: src/*.js test/*.test.js test/browser.js
	@node_modules/.bin/sourcegraph.js test/browser.js \
		--plugins mocha,nodeish,javascript \
		| node_modules/.bin/bigfile \
		 	--export null \
		 	--leave-paths \
		 	--plugins nodeish > test/built.js

clean:
	@rm -rf dist test/built.js components

Readme.md: src/index.js docs/head.md docs/tail.md
	@cat docs/head.md > Readme.md
	@cat src/index.js\
	 | sed s/.*=.$$//\
	 | sed s/proto\./State.prototype./\
	 | dox -a >> Readme.md
	@cat docs/tail.md >> Readme.md

.PHONY: all build test clean install
