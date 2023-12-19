#!/bin/bash
if [[ -e "venv" ]]; then
	source ./venv/bin/activate
	nohup python3 ./media.py >media.log &
else
	echo "no virtual environment detected. please run init.sh first"
fi
