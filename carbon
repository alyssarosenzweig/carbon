#!/usr/bin/sh

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
node $DIR/$1.js "${*:2}"
