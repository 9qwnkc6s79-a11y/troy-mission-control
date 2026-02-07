#!/usr/bin/env python3
"""
OpenClaw Gmail Integration
Handles Gmail OAuth, reading, and sending emails
"""

import os
import pickle
import base64
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Optional
import re

# Google API imports
try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    from email.mime.text import MimeText
    from email.mime.multipart import MimeMultipart
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False
    logging.warning("Google API libraries not available. Install with: pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GmailIntegration:
    def __init__(self, config_dir=None):
        """Initialize Gmail integration"""
        if not GOOGLE_AVAILABLE:
            raise ImportError("Google API libraries not available")
            
        self.config_dir = Path(config_dir or os.path.expanduser("~/.openclaw"))
        self.config_dir.mkdir(exist_ok=True)
        
        # OAuth scopes
        self.SCOPES = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.modify'
        ]
        
        self.service = None
        self.credentials = None
        
    def setup_oauth(self, client_secret_file=None):
        """Set up Gmail OAuth credentials"""
        token_file = self.config_dir / "gmail_token.pickle"
        credentials_file = self.config_dir / "gmail_credentials.json"
        
        # Use provided client secret file or look for default
        if client_secret_file:
            client_secret_path = Path(client_secret_file)
        else:
            client_secret_path = self.config_dir / "client_secret.json"
            
        # Load existing credentials
        if token_file.exists():
            with open(token_file, 'rb') as token:
                self.credentials = pickle.load(token)
        
        # Refresh or create credentials
        if not self.credentials or not self.credentials.valid:
            if self.credentials and self.credentials.expired and self.credentials.refresh_token:
                logger.info("Refreshing expired credentials...")
                self.credentials.refresh(Request())
            else:
                if not client_secret_path.exists():
                    raise FileNotFoundError(
                        f"Client secret file not found: {client_secret_path}\n"
                        "Download credentials.json from Google Cloud Console and place it there."
                    )
                
                logger.info("Starting OAuth flow...")
                flow = InstalledAppFlow.from_client_secrets_file(
                    str(client_secret_path), self.SCOPES
                )
                self.credentials = flow.run_local_server(port=8081)
            
            # Save credentials for next run
            with open(token_file, 'wb') as token:
                pickle.dump(self.credentials, token)
        
        # Build Gmail service
        self.service = build('gmail', 'v1', credentials=self.credentials)
        logger.info("Gmail integration initialized successfully")
        
    def get_unread_emails(self, max_results=10, since_hours=24) -> List[Dict]:
        """Get unread emails from the last N hours"""
        if not self.service:
            raise RuntimeError("Gmail service not initialized. Run setup_oauth() first.")
        
        try:
            # Calculate date filter
            since_date = datetime.now() - timedelta(hours=since_hours)
            date_string = since_date.strftime("%Y/%m/%d")
            
            # Search query
            query = f'is:unread after:{date_string}'
            
            results = self.service.users().messages().list(
                userId='me', 
                q=query, 
                maxResults=max_results
            ).execute()
            
            messages = results.get('messages', [])
            
            email_list = []
            for message in messages:
                email_data = self.get_email_details(message['id'])
                if email_data:
                    email_list.append(email_data)
            
            logger.info(f"Found {len(email_list)} unread emails")
            return email_list
            
        except HttpError as error:
            logger.error(f"Gmail API error: {error}")
            return []
    
    def get_email_details(self, message_id) -> Optional[Dict]:
        """Get detailed information about a specific email"""
        try:
            message = self.service.users().messages().get(
                userId='me', 
                id=message_id
            ).execute()
            
            headers = message['payload'].get('headers', [])
            
            # Extract headers
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
            sender = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown Sender')
            date = next((h['value'] for h in headers if h['name'] == 'Date'), '')
            
            # Extract body
            body = self.extract_body(message['payload'])
            
            return {
                'id': message_id,
                'subject': subject,
                'sender': sender,
                'date': date,
                'body': body,
                'snippet': message.get('snippet', ''),
                'thread_id': message.get('threadId', '')
            }
            
        except HttpError as error:
            logger.error(f"Error getting email details: {error}")
            return None
    
    def extract_body(self, payload) -> str:
        """Extract email body from payload"""
        body = ""
        
        if 'parts' in payload:
            for part in payload['parts']:
                if part['mimeType'] == 'text/plain':
                    data = part['body']['data']
                    body = base64.urlsafe_b64decode(data).decode('utf-8')
                    break
                elif part['mimeType'] == 'text/html':
                    # Fallback to HTML if no plain text
                    data = part['body']['data']
                    body = base64.urlsafe_b64decode(data).decode('utf-8')
                    # Basic HTML stripping
                    body = re.sub('<[^<]+?>', '', body)
        else:
            if payload.get('body', {}).get('data'):
                body = base64.urlsafe_b64decode(
                    payload['body']['data']
                ).decode('utf-8')
        
        return body.strip()
    
    def send_email(self, to_email, subject, body, from_name=None):
        """Send an email"""
        if not self.service:
            raise RuntimeError("Gmail service not initialized")
        
        try:
            message = MimeText(body)
            message['to'] = to_email
            message['subject'] = subject
            
            if from_name:
                message['from'] = from_name
            
            raw_message = base64.urlsafe_b64encode(
                message.as_bytes()
            ).decode('utf-8')
            
            send_message = {'raw': raw_message}
            
            result = self.service.users().messages().send(
                userId='me', 
                body=send_message
            ).execute()
            
            logger.info(f"Email sent successfully to {to_email}")
            return result
            
        except HttpError as error:
            logger.error(f"Error sending email: {error}")
            raise
    
    def mark_as_read(self, message_id):
        """Mark an email as read"""
        try:
            self.service.users().messages().modify(
                userId='me',
                id=message_id,
                body={'removeLabelIds': ['UNREAD']}
            ).execute()
            logger.info(f"Marked email {message_id} as read")
        except HttpError as error:
            logger.error(f"Error marking email as read: {error}")
    
    def create_task_from_email(self, email_data) -> str:
        """Convert email to task description"""
        subject = email_data['subject']
        sender = email_data['sender']
        body = email_data['body']
        
        # Extract sender name from email
        sender_name = sender.split('<')[0].strip() if '<' in sender else sender
        
        # Create task description
        task_description = f"""New email task from {sender_name}:

Subject: {subject}

Content: {body[:500]}{'...' if len(body) > 500 else ''}

Action required: Respond to this email or take appropriate action.
Email ID: {email_data['id']}
"""
        return task_description

class EmailAutomation:
    """High-level email automation functionality"""
    
    def __init__(self):
        self.gmail = GmailIntegration()
        self.config_file = Path.home() / ".openclaw" / "email_config.json"
        self.load_config()
    
    def load_config(self):
        """Load email automation configuration"""
        if self.config_file.exists():
            with open(self.config_file) as f:
                self.config = json.load(f)
        else:
            self.config = {
                'auto_respond_enabled': False,
                'auto_respond_message': 'Thank you for your email. I have received it and will respond shortly.',
                'task_creation_enabled': True,
                'priority_keywords': ['urgent', 'asap', 'important', 'critical'],
                'auto_mark_read': True
            }
            self.save_config()
    
    def save_config(self):
        """Save email automation configuration"""
        self.config_file.parent.mkdir(exist_ok=True)
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def setup(self, client_secret_file=None):
        """Set up email automation"""
        logger.info("Setting up Gmail OAuth...")
        self.gmail.setup_oauth(client_secret_file)
        logger.info("Email automation ready!")
    
    def process_emails(self):
        """Process unread emails and create tasks"""
        emails = self.gmail.get_unread_emails()
        tasks_created = []
        
        for email in emails:
            # Check if this is a priority email
            is_priority = any(
                keyword in email['subject'].lower() or keyword in email['body'].lower()
                for keyword in self.config['priority_keywords']
            )
            
            # Create task if enabled
            if self.config['task_creation_enabled']:
                task = self.gmail.create_task_from_email(email)
                tasks_created.append({
                    'email_id': email['id'],
                    'task': task,
                    'priority': is_priority,
                    'sender': email['sender'],
                    'subject': email['subject']
                })
            
            # Auto-respond if enabled
            if self.config['auto_respond_enabled'] and not is_priority:
                try:
                    # Extract sender email
                    sender_email = email['sender']
                    if '<' in sender_email:
                        sender_email = sender_email.split('<')[1].split('>')[0]
                    
                    self.gmail.send_email(
                        to_email=sender_email,
                        subject=f"Re: {email['subject']}",
                        body=self.config['auto_respond_message']
                    )
                except Exception as e:
                    logger.error(f"Failed to auto-respond to {email['sender']}: {e}")
            
            # Mark as read if configured
            if self.config['auto_mark_read']:
                self.gmail.mark_as_read(email['id'])
        
        return tasks_created

def main():
    """Main function for testing"""
    if not GOOGLE_AVAILABLE:
        print("❌ Google API libraries not installed.")
        print("Install with: pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib")
        return
    
    automation = EmailAutomation()
    
    try:
        print("🔧 Setting up Gmail integration...")
        automation.setup()
        
        print("📧 Processing emails...")
        tasks = automation.process_emails()
        
        print(f"✅ Created {len(tasks)} tasks from emails")
        for task in tasks:
            priority = "🔥 PRIORITY" if task['priority'] else "📋"
            print(f"{priority} {task['subject']} - {task['sender']}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()