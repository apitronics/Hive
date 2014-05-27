#!/bin/sh
systemctl stop hive-router.service
systemctl stop hive-redirect.service
systemctl stop hive-beekeeper.service
systemctl stop hive-honeycomb.service
systemctl stop hive-queen.service
systemctl stop hive-xbeepython.service
