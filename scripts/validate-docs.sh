#!/bin/bash

# Forbidden terms list
FORBIDDEN_TERMS=("BoQItem" "initialBoQ" "mockBoQ")
SEARCH_DIR="src"

echo "🔍 Scanning for forbidden terminology in $SEARCH_DIR..."

FOUND_ERROR=0

for term in "${FORBIDDEN_TERMS[@]}"; do
    if grep -r --exclude-dir={node_modules,.next,.git} "$term" "$SEARCH_DIR"; then
        echo "❌ Error: Found forbidden term '$term'. Please use 'CostItem' or updated terminology."
        FOUND_ERROR=1
    fi
done

# Also check docs for stale "Bill of Quantities" references that imply it's the current term
# We allow it if it's in a "History" or "Translation" context, but let's be strict for now.
if grep -r "Bill of Quantities" docs/ | grep -v "formerly" | grep -v "previously"; then
     echo "⚠️  Warning: Found 'Bill of Quantities' in docs. Ensure it clarifies that we now use 'Cost Items'."
     # We won't fail on this for docs, just warn, as it might be explanatory text.
fi

if [ $FOUND_ERROR -eq 1 ]; then
    exit 1
fi

echo "✅ Terminology check passed."
exit 0
