#!/bin/bash

NAME='pb'
USER='_user'
PASSWORD='_password'

if [ -n "$1" ]; then
    NAME=$1
fi

createDb() {
    psql -c "CREATE USER $NAME$USER;"
    psql -c "alter user $NAME$USER with encrypted password '$NAME$PASSWORD';"
    psql -c "CREATE DATABASE $NAME;"
    psql -d $NAME -c "CREATE EXTENSION postgis;"
    psql -c "grant all privileges on database $NAME to $NAME$USER;"
}

createDb
