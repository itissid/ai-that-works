#!/bin/bash

# Extract URLs and download each one
while IFS= read -r line; do
    if [[ $line =~ \(https://docs\.boundaryml\.com/([^\)]+)\) ]]; then
        url="https://docs.boundaryml.com/${BASH_REMATCH[1]}"
        filename="${BASH_REMATCH[1]//\//_}"
        echo "Downloading: $url -> $filename"
        curl -s -o "$filename" "$url"
    fi
done < llms.txt

echo "Done downloading all files"
