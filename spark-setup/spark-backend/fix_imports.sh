#!/bin/bash

# Fix all relative imports in Go files
find . -name "*.go" -exec sed -i 's/^[[:space:]]*"\.$"/\t"Spark\/modules"/g' {} \;
find . -name "*.go" -exec sed -i 's/^[[:space:]]*"\.\/melody"/\t"Spark\/utils\/melody"/g' {} \;
find . -name "*.go" -exec sed -i 's/^[[:space:]]*"\.\/cmap"/\t"Spark\/utils\/cmap"/g' {} \;
find . -name "*.go" -exec sed -i 's/^[[:space:]]*"\.config"/\t"Spark\/config"/g' {} \;
find . -name "*.go" -exec sed -i 's/^[[:space:]]*"\.common"/\t"Spark\/common"/g' {} \;
find . -name "*.go" -exec sed -i 's/^[[:space:]]*"\.auth"/\t"Spark\/auth"/g' {} \;
find . -name "*.go" -exec sed -i 's/^[[:space:]]*"\.handler"/\t"Spark\/handler"/g' {} \;
find . -name "*.go" -exec sed -i 's/^[[:space:]]*"\.handler\/bridge"/\t"Spark\/handler\/bridge"/g' {} \;
find . -name "*.go" -exec sed -i 's/^[[:space:]]*"\.handler\/desktop"/\t"Spark\/handler\/desktop"/g' {} \;
find . -name "*.go" -exec sed -i 's/^[[:space:]]*"\.handler\/file"/\t"Spark\/handler\/file"/g' {} \;
find . -name "*.go" -exec sed -i 's/^[[:space:]]*"\.handler\/generate"/\t"Spark\/handler\/generate"/g' {} \;
find . -name "*.go" -exec sed -i 's/^[[:space:]]*"\.handler\/process"/\t"Spark\/handler\/process"/g' {} \;
find . -name "*.go" -exec sed -i 's/^[[:space:]]*"\.handler\/screenshot"/\t"Spark\/handler\/screenshot"/g' {} \;
find . -name "*.go" -exec sed -i 's/^[[:space:]]*"\.handler\/terminal"/\t"Spark\/handler\/terminal"/g' {} \;
find . -name "*.go" -exec sed -i 's/^[[:space:]]*"\.handler\/utility"/\t"Spark\/handler\/utility"/g' {} \;
find . -name "*.go" -exec sed -i 's/^[[:space:]]*"\.utils"/\t"Spark\/utils"/g' {} \;
find . -name "*.go" -exec sed -i 's/^[[:space:]]*"\.utils\/cmap"/\t"Spark\/utils\/cmap"/g' {} \;
find . -name "*.go" -exec sed -i 's/^[[:space:]]*"\.utils\/melody"/\t"Spark\/utils\/melody"/g' {} \;
