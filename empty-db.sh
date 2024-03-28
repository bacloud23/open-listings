#!/bin/bash

echo 'Deleting database'
docker stop $(docker ps -a -q --filter "name=mongo")
docker rm $(docker ps -a -q --filter "name=mongo")
docker volume rm mongo_data
docker volume create --name=mongo_data
docker compose up -d