#!/bin/bash
kill -9 `ps aux|grep /var/www/api/start-server.sh|grep -v grep|awk '{print $2}'`
