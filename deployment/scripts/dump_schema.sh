#!/bin/bash

echo 'Dumping schema (without data) to gula.sql'
pg_dump -s gula > ../sql/gula.sql
