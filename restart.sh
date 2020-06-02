#!/bin/sh
pkill -9 -f "./target/release/twitch-stats-server"
nohup ./target/release/twitch-stats-server &
