
# Queues 

* To check if xqueue is running:

``` shell
sudo /edx/bin/supervisorctl -c /edx/etc/supervisord.conf status
```
 
* To add a queue:

    1. edit /edx/app/xqueue/xqueue.env.json
    2. add a new queue: `{ "extgrad.octave.pah.polimi.it": "http://192.168.1.106:1666" }`

## To restart the EDX studio

``` shell
sudo /edx/bin/supervisorctl -c /edx/etc/supervisord.conf restart edxapp:
```

