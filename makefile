# Makefile autogenerated by Dyi on May 15, 2016
#
# Main target: all
# Sources: 

.DEFAULT_GOAL := all


.PHONY: docs
docs: k-74b6rcjn k-l0dkxfiy k-ndq3rmum k-i6i9cbc1 k-or5xt4nu k-bairj9gj


.PHONY: devloop
devloop: k-moj8452r k-fhxlwquk


.PHONY: buildloop
buildloop: k-gi49t9i5


.PHONY: testloop
testloop: k-vryg7kjn


.PHONY: stoploop
stoploop: k-cks58e1a k-17h9f5xq


.PHONY: build
build: k-fb211nur


.PHONY: start
start: k-oim3mmmi


.PHONY: test
test: k-o4i6c5qw k-wlxrp274


.PHONY: test-local-endpoint
test-local-endpoint: k-tpiw0qnl k-4rsixel9


.PHONY: update
update: k-x8edtnnc


.PHONY: major
major: k-ijx6pu6t k-b585ve25 k-pxxs2yns


.PHONY: minor
minor: k-eww6esjh k-k2av5rds k-r3sqpfh6


.PHONY: patch
patch: k-1j500di2 k-x7fdqnm1 k-6xrd01to


.PHONY: prepare
prepare:




.PHONY: k-74b6rcjn
k-74b6rcjn:  
	./node_modules/.bin/git-hist history.md


.PHONY: k-l0dkxfiy
k-l0dkxfiy:  
	./node_modules/.bin/mustache package.json docs/readme.md | ./node_modules/.bin/stupid-replace '~USAGE~' -f docs/usage.md > readme.md


.PHONY: k-ndq3rmum
k-ndq3rmum:  
	cat history.md >> readme.md


.PHONY: k-i6i9cbc1
k-i6i9cbc1:  
	mkdir -p ./man/man1


.PHONY: k-or5xt4nu
k-or5xt4nu:  
	pandoc -s -f markdown -t man readme.md > ./man/man1/vz-dockerino.1


.PHONY: k-bairj9gj
k-bairj9gj:  
	-hub cm 'update docs and history.md'


.PHONY: k-moj8452r
k-moj8452r:  
	make buildloop &


.PHONY: k-fhxlwquk
k-fhxlwquk:  
	make testloop &


.PHONY: k-gi49t9i5
k-gi49t9i5:  
	./node_modules/.bin/babel src -d lib --watch --presets es2015,stage-2


.PHONY: k-vryg7kjn
k-vryg7kjn:  
	./node_modules/.bin/mocha -w ./lib/test.js


.PHONY: k-cks58e1a
k-cks58e1a:  
	-pkill -9 -f '.*mocha.*'


.PHONY: k-17h9f5xq
k-17h9f5xq:  
	-pkill -9 -f '.*babel.*watch.*'


.PHONY: k-fb211nur
k-fb211nur:  
	./node_modules/.bin/babel src -d lib --presets es2015,stage-2


.PHONY: k-rgw6eqdq
k-rgw6eqdq:  
	((echo '#!/usr/bin/env node') && cat ./lib/index.js) > index.js


.PHONY: k-u7cp753t
k-u7cp753t:  
	chmod +x ./index.js


.PHONY: all
all: 
	make build 
	make k-rgw6eqdq 
	make k-u7cp753t  


.PHONY: k-oim3mmmi
k-oim3mmmi:  
	npm start


.PHONY: k-o4i6c5qw
k-o4i6c5qw:  
	make all


.PHONY: k-wlxrp274
k-wlxrp274:  
	./node_modules/.bin/mocha ./lib/test.js


.PHONY: k-tpiw0qnl
k-tpiw0qnl:  
	make all


.PHONY: k-4rsixel9
k-4rsixel9:  
	mocha --no-timeouts lib/testEndPoint.js


.PHONY: k-x8edtnnc
k-x8edtnnc:  
	make clean && ./node_modules/.bin/babel --presets es2015,stage-2 configure.js | node


.PHONY: k-ijx6pu6t
k-ijx6pu6t:  
	make all


.PHONY: k-b585ve25
k-b585ve25:  
	make docs


.PHONY: k-pxxs2yns
k-pxxs2yns:  
	./node_modules/.bin/xyz -i major


.PHONY: k-eww6esjh
k-eww6esjh:  
	make all


.PHONY: k-k2av5rds
k-k2av5rds:  
	make docs


.PHONY: k-r3sqpfh6
k-r3sqpfh6:  
	./node_modules/.bin/xyz -i minor


.PHONY: k-1j500di2
k-1j500di2:  
	make all


.PHONY: k-x7fdqnm1
k-x7fdqnm1:  
	make docs


.PHONY: k-6xrd01to
k-6xrd01to:  
	./node_modules/.bin/xyz -i patch


.PHONY: clean
clean:  




