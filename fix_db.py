from backend.app.database.db_manager import init_db, get_db_session
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import sqlalchemy
import os
import glob

def fix_all_db_sessions():
    try:
        # Initialize the database
        engine = init_db()
        
        # Create a new Session class
        Session = sessionmaker(bind=engine)
        
        # Get the database URI
        db_uri = engine.url.render_as_string(hide_password=False)
        
        # If using SQLite (most likely for development), find the database file
        if db_uri.startswith('sqlite:///'):
            db_path = db_uri.replace('sqlite:///', '')
            print(f"Database path: {db_path}")
            
            # Find any journal or WAL files
            journal_files = glob.glob(f"{db_path}*-journal")
            wal_files = glob.glob(f"{db_path}*-wal")
            
            print(f"Found {len(journal_files)} journal files and {len(wal_files)} WAL files")
            
            # Handle journal files (transactions in progress)
            for file in journal_files:
                print(f"Found journal file: {file}")
        
        # Create a clean new session and verify it works
        session = Session()
        
        # Try a test query
        try:
            session.execute(text('SELECT 1'))
            print('Test query successful - database connection is working correctly')
        except sqlalchemy.exc.InvalidRequestError as e:
            print(f'Error with test query: {e}')
            print('Attempting to rollback pending transactions...')
            session.rollback()
            print('Session rolled back')
        
        # Try to commit any pending transactions
        try:
            session.commit()
            print('Commit successful')
        except Exception as e:
            print(f'Commit failed: {e}')
            session.rollback()
            print('Rolled back instead')
        
        # Close the session
        session.close()
        
        # Verify with a new clean session
        verify_session = Session()
        verify_session.execute(text('SELECT 1'))
        verify_session.close()
        
        print('Database connection now working correctly!')
    except Exception as e:
        print(f'Error fixing database: {e}')

if __name__ == "__main__":
    fix_all_db_sessions() 