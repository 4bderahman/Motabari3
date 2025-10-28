#!/bin/bash
# Script to check for case sensitivity issues in file paths and imports

echo "Checking for case sensitivity issues in imports and file paths..."

# Find files with mixed case
find . -type f -name "*.js*" -not -path "./node_modules/*" -not -path "./dist/*" -not -path "./server/node_modules/*" | grep -i "[a-z].*[A-Z]" | sort > case_sensitive_files.txt

if [ -s case_sensitive_files.txt ]; then
  echo "Warning: Found files with mixed case that could cause issues on case-sensitive file systems:"
  cat case_sensitive_files.txt
  echo ""
fi

# Check for mismatched imports
echo "Checking for import path mismatches..."

# Find all import statements and process them
grep -r "import.*from" --include="*.js*" --exclude-dir="node_modules" --exclude-dir="dist" . |
while read -r line; do
  file=$(echo "$line" | cut -d':' -f1)
  import=$(echo "$line" | sed -n 's/.*from ['"'"'"]\(.*\)['"'"'"].*/\1/p')

  # Only check relative imports (skip node modules and absolute paths)
  if [[ $import == .* ]]; then
    # Extract directory of the file
    dir=$(dirname "$file")

    # Normalize the import path
    if [[ $import == ./* ]]; then
      target_path="$dir/${import:2}"
    elif [[ $import == ../* ]]; then
      target_path="$(cd "$dir" && cd .. && pwd)/${import:3}"
    else
      continue
    fi

    # Remove file extension if present in import
    target_path=${target_path%.js}
    target_path=${target_path%.jsx}

    # Check if file exists (with any extension)
    if ! ls "$target_path"*.js* 1> /dev/null 2>&1; then
      echo "Potential missing import in $file: $import"
    fi
  fi
done

echo "Checking imports that use '../src/' pattern..."
grep -r "import.*from ['\"]../src/" --include="*.js*" --exclude-dir="node_modules" --exclude-dir="dist" .
if [ $? -eq 0 ]; then
  echo "⚠️  Warning: Found imports using '../src/' which may cause issues. Consider using relative paths."
else
  echo "✅ No '../src/' imports found."
fi

echo "Check complete!"
