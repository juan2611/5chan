#!/bin/bash
if [[ -e "venv" ]]; then
	rm -r ./venv
	rm -r ./__pycache__
fi
rm -r ./files
rm -r ./local
python3 -m venv ./venv
source ./venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate
echo "initialization over."
