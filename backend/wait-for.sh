#!/bin/sh
# Wait for MySQL to be ready
until nc -z -v -w30 $DB_HOST 3306
do
  echo "Waiting for MySQL..."
  sleep 5
done

# Run Node
node server.js
