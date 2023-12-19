#!/bin/bash
# DEV ONLY
PKG_DIR=$(pwd)
cd "${PKG_DIR}/post" && bash init.sh
cd "${PKG_DIR}/login" && bash init.sh
cd "${PKG_DIR}/user" && bash init.sh
cd "${PKG_DIR}/comment" && bash init.sh
cd "${PKG_DIR}/media" && bash init.sh
