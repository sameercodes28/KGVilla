#!/bin/bash

# validate-docs.sh
# Prevents forbidden terms from entering the documentation or codebase.

FORBIDDEN_TERMS=("BoQ" "Bill of Quantities")
ALLOWED_CONTEXT="CostItem|Bill of Quantities based on BBR" # Exceptions

echo "🔍 Scanning for forbidden terms..."
FOUND_ERRORS=0

for term in "${FORBIDDEN_TERMS[@]}"; do
    # Search recursively, excluding .git, node_modules, and this script
    # We use grep to find the term
    # Added exclude for .gemini-clipboard to ignore binary/image matches
    matches=$(grep -r "$term" . \
        --exclude-dir=.git \
        --exclude-dir=node_modules \
        --exclude-dir=.next \
        --exclude-dir=out \
        --exclude-dir=.gemini-clipboard \
        --exclude="validate-docs.sh" \
        --exclude="GEMINI.md" \
        --exclude="*.log")

    if [ ! -z "$matches" ]; then
        echo "❌ Found forbidden term '$term' in:"
        echo "$matches"
        FOUND_ERRORS=1
    fi
done

if [ $FOUND_ERRORS -eq 1 ]; then
    echo "⚠️  Validation Failed: Forbidden terms found. Please use 'Cost Breakdown' or 'Project Estimate' instead."
    exit 1
else
    echo "✅ Documentation validation passed."
    exit 0
fi
