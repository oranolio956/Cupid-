#!/bin/bash

# Fix all import statements to use local module
find . -name "*.go" -type f -exec sed -i 's|Spark/client/|spark-client/|g' {} \;
find . -name "*.go" -type f -exec sed -i 's|Spark/modules|spark-client/modules|g' {} \;
find . -name "*.go" -type f -exec sed -i 's|Spark/utils|spark-client/utils|g' {} \;

echo "Import statements fixed"