
#
# run: make tag-0.3
#

tag-%:
	docker --tlsverify build -t dockerino-v$* .

push-%:
	docker --tlsverify tag dockerino-v$* vzaccaria/dockerino:$*
	docker --tlsverify push vzaccaria/dockerino
