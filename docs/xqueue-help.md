Setup del container con il grader
=================================

-   Il grader e' disponibile come immagine su dockerhub. Dovrebbe
    bastare questa linea comando per lanciarlo come demone (`-d`) sulla
    porta 3000:

    ``` shell
    docker run -d -p 3000:3000 vzaccaria/dockerino:0.0.6
    ```

-   Per mapparlo su una porta `Y` differente, usare:

    ``` shell
    docker run -d -p <<Y>>:3000 vzaccaria/dockerino:0.0.6
    ```

Setup di EDX:
=============

-   Controllare che xqueue stia girando

    ``` shell
    sudo /edx/bin/supervisorctl -c /edx/etc/supervisord.conf status
    ```

-   Per aggiungere una coda:

    1.  edit /edx/app/xqueue/xqueue.env.json
    2.  add a new queue: `{ "octave": "http://<<IPMACCHINAGRADER>>:3000" }`
-   Far ripartire edx?
