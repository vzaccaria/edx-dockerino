
# To generate a new version of the docker image:
#
# 1. Update version in docker file (0.0.X)
# 2. make tag-0.0.X
# 3. make push-0.0.X
# --
# To launch on the production machine:
#
# prod> docker run -d -p 3000:3000 vzaccaria/dockerino:0.0.X

tag-%:
	docker --tlsverify build -t dockerino-v$* .

push-%:
	docker --tlsverify tag dockerino-v$* vzaccaria/dockerino:$*
	docker --tlsverify push vzaccaria/dockerino
