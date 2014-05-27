#!/bin/sh
systemctl start hive-router.service
systemctl start hive-redirect.service
systemctl start hive-beekeeper.service
systemctl start hive-honeycomb.service
systemctl start hive-queen.service
systemctl start hive-xbeepython.service
