#!/bin/bash
if [[ -e "venv" ]]; then
	rm -rf ./venv
fi
python3 -m venv ./venv
source ./venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install flask-cors
deactivate
echo "initialization over."
