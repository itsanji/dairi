#!/bin/bash

# Ensure you're in the root directory of your React project when running this script.

# Step 1: Install Tailwind CSS, PostCSS, and autoprefixer
echo "Installing Tailwind CSS and dependencies..."
bun add tailwindcss postcss autoprefixer -d

# Step 2: Generate Tailwind config and PostCSS config
echo "Generating Tailwind config and PostCSS config..."
bun tailwindcss init -p

# Step 3: Configure your template paths
# Add the paths to all of your template files in your tailwind.config.js file.
echo "Configuring Tailwind..."
sed -i "s|content: \[\],|content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],|g" tailwind.config.js

# Step 4: Safely add Tailwind directives to the top of your CSS file
echo "Adding Tailwind directives to your CSS..."
echo -e "@import 'tailwindcss/base';\n@import 'tailwindcss/components';\n@import 'tailwindcss/utilities';\n$(cat src/index.css)" > src/index.css.tmp && mv src/index.css.tmp src/index.css

echo "Tailwind CSS setup completed."

# Reminder message
echo "Remember to import the CSS file in your React entry file if not already done."
