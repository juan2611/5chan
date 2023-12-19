#!/bin/bash
if [[ -e "venv" ]]; then
	source ./venv/bin/activate
	nohup python3 ./post.py >post.log &
else
	echo "no virtual environment detected. please run init.sh first"
fi
