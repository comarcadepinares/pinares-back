#!/bin/bash

NAME='pb'
USER='_user'
PASSWORD='_password'

if [ -n "$1" ]; then
    NAME=$1
fi

createDb() {
    psql -U postgres -c "CREATE USER $NAME$USER;"
    psql -U postgres -c "alter user $NAME$USER with encrypted password '$NAME$PASSWORD';"
    psql -U postgres -c "CREATE DATABASE $NAME;"
    psql -U postgres -d $NAME -c "CREATE EXTENSION postgis;"
    psql -U postgres -c "grant all privileges on database $NAME to $NAME$USER;"
}

createDb
