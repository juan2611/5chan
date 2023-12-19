#!/bin/bash
#TEST ONLY!!!! NOT FOR DEPLOYMENT
PKG_DIR=$(pwd)
cd "${PKG_DIR}/post" && bash start.sh
cd "${PKG_DIR}/login" && bash start.sh
cd "${PKG_DIR}/user" && bash start.sh
cd "${PKG_DIR}/comment" && bash start.sh
cd "${PKG_DIR}/media" && bash start.sh
