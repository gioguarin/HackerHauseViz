#!/bin/bash

# Quick Start Script for HackerHause Visualizer
# This script starts a local development server

PORT=8000

echo "🚀 Starting HackerHause Visualizer Dev Server..."
echo ""
echo "Options:"
echo "  1) Python HTTP Server (no npm, uses CDN)"
echo "  2) Vite Dev Server (npm packages, HMR)"
echo "  3) Just open original index.html"
echo ""
read -p "Choose option (1-3): " choice

case $choice in
    1)
        echo ""
        echo "Starting Python HTTP Server on port $PORT..."
        echo "📡 Server: http://localhost:$PORT"
        echo "📄 CDN Version: http://localhost:$PORT/index-cdn.html"
        echo "📄 Original: http://localhost:$PORT/index.html"
        echo ""
        echo "⚠️  Use index-cdn.html for modular version with Python"
        echo "Press Ctrl+C to stop the server"
        echo ""
        python3 -m http.server $PORT
        ;;
    2)
        if [ ! -d "node_modules" ]; then
            echo ""
            echo "📦 Installing dependencies first..."
            npm install
        fi
        echo ""
        echo "Starting Vite Dev Server..."
        echo "📄 Opens: index-modular.html"
        npm run dev:vite
        ;;
    3)
        echo ""
        echo "Opening original single-file version..."
        open index.html
        ;;
    *)
        echo "Invalid choice. Please run the script again and choose 1-3."
        exit 1
        ;;
esac
