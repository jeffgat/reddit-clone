#!/bin/bash

echo what version?
read VERSION

docker build -t jeffgat/reddit2:$VERSION .
docker push jeffgat/reddit2:$VERSION
ssh root@167.99.160.131 "docker pull jeffgat/reddit2:$VERSION && docker tag jeffgat/reddit2:$VERSION dokku/api:$VERSION && dokku deploy api $VERSION"