#!/bin/bash

rm *.tar.gz
rm -r ./client-server/venv ./client-server/__pycache__
rm -r ./services/venv ./services/__pycache ./services/*.db*
tar -zcvf media.tar.gz media
tar -zcvf services.tar.gz services
tar -zcvf client.tar.gz client-server
