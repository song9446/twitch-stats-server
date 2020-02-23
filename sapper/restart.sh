#!/bin/sh
pkill -9 -f "node __sapper__/build" 
nohup node __sapper__/build &
