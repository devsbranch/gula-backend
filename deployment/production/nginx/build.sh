#!/usr/bin/env bash
IMAGE_NAME=gula_nginx
TAG_NAME=latest
docker build --no-cache -t sonlinux/${IMAGE_NAME} .
docker tag sonlinux/${IMAGE_NAME}:latest sonlinux/${IMAGE_NAME}:${TAG_NAME}
docker push sonlinux/${IMAGE_NAME}:${TAG_NAME}
