#!/bin/sh
pkill -9 -f "./target/release/twitch-stats-server"
./target/release/twitch-stats-server
