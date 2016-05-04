
# Update version in docker file (0.0.X)
# run: make tag-0.0.X
#      make push-0.0.X

tag-%:
	docker --tlsverify build -t dockerino-v$* .

push-%:
	docker --tlsverify tag dockerino-v$* vzaccaria/dockerino:$*
	docker --tlsverify push vzaccaria/dockerino
