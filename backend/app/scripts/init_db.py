#!/usr/bin/env python3
"""
Database initialization script for FarmSocial backend.
Ensures that all required tables are created.
"""

import os
import sys
import logging

# Add the parent directory to the path to allow importing from app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database import init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """Initialize the database."""
    logger.info("Initializing the database...")
    engine = init_db()
    logger.info("Database initialized successfully.")

if __name__ == "__main__":
    main() 