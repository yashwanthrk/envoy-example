Spin up with:

```shell
docker-compose up
```

Send an API request:
```shell
> curl -i 'localhost:4000/calculate?input=xalsjkdf'
HTTP/1.1 200 OK
date: Thu, 06 May 2021 08:25:34 GMT
server: envoy
content-length: 96
content-type: application/json
x-envoy-upstream-service-time: 201

{"input":"xalsjkdf","result":"b5bb764b1ad22b3c2b28261accbbd8f68ca17e88b522d0df3fe1754fc51d59ad"}
```


Reference [in the blog post]

(https://blog.krudewig-online.de/2021/04/18/envoy-in-5-minutes.html).
