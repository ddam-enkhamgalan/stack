#!/bin/bash
set -e

# Create additional databases or users if needed
# This script runs during the first initialization of the PostgreSQL container

echo "Creating Stack database schema..."

# You can add additional SQL commands here if needed
# For now, the database 'stack' is already created by POSTGRES_DB

echo "Database initialization completed."
