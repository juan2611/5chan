#!/bin/bash
if [[ -e "venv" ]]; then
	source ./venv/bin/activate
	nohup python3 ./comment.py >comment.log &
else
	echo "no virtual environment detected. please run init.sh first"
fi
