#!/bin/bash
set -e

ollama serve &

# Wait for Ollama server to be ready using the built-in CLI
until ollama list > /dev/null 2>&1; do
  echo "Waiting for Ollama server to start..."
  sleep 2
done

ollama pull llava:7b

wait