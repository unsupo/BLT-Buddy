#!/usr/bin/env bash
function process_checker(){
    cmd="$1"
    if ! ps aux | grep -v grep | grep "${cmd}" > /dev/null; then
        $(${cmd})
    fi
}

process_checker "sleep 50"