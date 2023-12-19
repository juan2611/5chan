#!/bin/bash
#TEST ONLY!!!! NOT FOR DEPLOYMENT
PKG_DIR=$(pwd)
cd "${PKG_DIR}/post" && bash stop.sh
cd "${PKG_DIR}/login" && bash stop.sh
cd "${PKG_DIR}/user" && bash stop.sh
cd "${PKG_DIR}/comment" && bash stop.sh
cd "${PKG_DIR}/media" && bash stop.sh
