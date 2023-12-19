#!/bin/bash
if [[ -e "venv" ]]; then
	source ./venv/bin/activate
	nohup python3 ./user.py >user.log &
else
	echo "no virtual environment detected. please run init.sh first"
fi
