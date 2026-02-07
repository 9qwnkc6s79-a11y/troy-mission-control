#!/usr/bin/env python3
"""
OpenClaw iMessage/SMS Integration via BlueBubbles
Enables SMS and iMessage sending from AI interface
"""

import json
import logging
import requests
import asyncio
import websockets
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
import subprocess
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BlueBubblesIntegration:
    def __init__(self, config_dir=None):
        """Initialize BlueBubbles integration"""
        self.config_dir = Path(config_dir or Path.home() / ".openclaw")
        self.config_dir.mkdir(exist_ok=True)
        self.config_file = self.config_dir / "bluebubbles_config.json"
        
        self.server_url = None
        self.password = None
        self.websocket_url = None
        self.session = requests.Session()
        
        self.load_config()
    
    def load_config(self):
        """Load BlueBubbles configuration"""
        if self.config_file.exists():
            with open(self.config_file) as f:
                config = json.load(f)
                self.server_url = config.get('server_url', 'http://localhost:1234')
                self.password = config.get('password', '')
                self.websocket_url = config.get('websocket_url', 'ws://localhost:1234')
        else:
            # Create default config
            default_config = {
                'server_url': 'http://localhost:1234',
                'password': '',
                'websocket_url': 'ws://localhost:1234',
                'auto_mark_read': True,
                'contact_aliases': {}
            }
            self.save_config(default_config)
    
    def save_config(self, config):
        """Save BlueBubbles configuration"""
        with open(self.config_file, 'w') as f:
            json.dump(config, f, indent=2)
    
    def setup_connection(self, server_url=None, password=None):
        """Set up connection to BlueBubbles server"""
        if server_url:
            self.server_url = server_url
        if password:
            self.password = password
            
        # Test connection
        if not self.test_connection():
            raise ConnectionError("Failed to connect to BlueBubbles server")
        
        # Update config
        config = {
            'server_url': self.server_url,
            'password': self.password,
            'websocket_url': self.server_url.replace('http', 'ws'),
            'auto_mark_read': True,
            'contact_aliases': {}
        }
        self.save_config(config)
        
        logger.info("BlueBubbles connection established")
    
    def test_connection(self) -> bool:
        """Test connection to BlueBubbles server"""
        try:
            response = self.session.get(
                f"{self.server_url}/api/v1/server/info",
                headers={"Authorization": self.password} if self.password else {},
                timeout=5
            )
            
            if response.status_code == 200:
                logger.info("BlueBubbles server connection successful")
                return True
            else:
                logger.error(f"BlueBubbles server returned {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to connect to BlueBubbles: {e}")
            return False
    
    def send_message(self, recipient, message, chat_guid=None):
        """Send a message via iMessage/SMS"""
        try:
            # Prepare message data
            payload = {
                "chatGuid": chat_guid,
                "message": message,
                "method": "apple-script"  # or "private-api" if available
            }
            
            # If no chat_guid, try to find or create chat
            if not chat_guid:
                chat_guid = self.find_or_create_chat(recipient)
                payload["chatGuid"] = chat_guid
            
            headers = {}
            if self.password:
                headers["Authorization"] = self.password
            
            response = self.session.post(
                f"{self.server_url}/api/v1/message/text",
                json=payload,
                headers=headers
            )
            
            if response.status_code == 200:
                logger.info(f"Message sent to {recipient}: {message}")
                return response.json()
            else:
                logger.error(f"Failed to send message: {response.status_code} - {response.text}")
                raise Exception(f"Send failed: {response.text}")
                
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            raise
    
    def find_or_create_chat(self, recipient):
        """Find existing chat or create new one with recipient"""
        try:
            # Search for existing chats
            headers = {}
            if self.password:
                headers["Authorization"] = self.password
            
            # Get chats
            response = self.session.get(
                f"{self.server_url}/api/v1/chat",
                headers=headers
            )
            
            if response.status_code == 200:
                chats = response.json()
                
                # Look for chat with this recipient
                for chat in chats.get('data', []):
                    participants = chat.get('participants', [])
                    for participant in participants:
                        if (participant.get('address') == recipient or 
                            participant.get('phoneNumber') == recipient):
                            return chat['guid']
                
                # If no existing chat found, create a new one
                # This typically requires starting a conversation first
                logger.info(f"No existing chat found for {recipient}, will create new one")
                return None
            else:
                logger.error(f"Failed to get chats: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error finding chat: {e}")
            return None
    
    def get_recent_messages(self, limit=20, after_date=None):
        """Get recent messages"""
        try:
            headers = {}
            if self.password:
                headers["Authorization"] = self.password
            
            params = {"limit": limit}
            if after_date:
                params["after"] = after_date
            
            response = self.session.get(
                f"{self.server_url}/api/v1/message",
                headers=headers,
                params=params
            )
            
            if response.status_code == 200:
                messages = response.json()
                return messages.get('data', [])
            else:
                logger.error(f"Failed to get messages: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting messages: {e}")
            return []
    
    def get_contacts(self):
        """Get contacts list"""
        try:
            headers = {}
            if self.password:
                headers["Authorization"] = self.password
            
            response = self.session.get(
                f"{self.server_url}/api/v1/contact",
                headers=headers
            )
            
            if response.status_code == 200:
                contacts = response.json()
                return contacts.get('data', [])
            else:
                logger.error(f"Failed to get contacts: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting contacts: {e}")
            return []
    
    def resolve_contact(self, identifier):
        """Resolve contact name/alias to phone number or address"""
        # Check config aliases first
        config = json.load(open(self.config_file))
        aliases = config.get('contact_aliases', {})
        
        if identifier in aliases:
            return aliases[identifier]
        
        # If it looks like a phone number or email, use as-is
        if '@' in identifier or identifier.replace('+', '').replace('-', '').replace(' ', '').isdigit():
            return identifier
        
        # Try to find in contacts
        contacts = self.get_contacts()
        for contact in contacts:
            if (contact.get('displayName', '').lower() == identifier.lower() or
                contact.get('firstName', '').lower() == identifier.lower() or
                contact.get('lastName', '').lower() == identifier.lower()):
                
                # Return primary phone number
                phones = contact.get('phoneNumbers', [])
                if phones:
                    return phones[0].get('address')
        
        # If not found, return as-is and let BlueBubbles handle it
        return identifier

class iMessageAutomation:
    """High-level iMessage automation functionality"""
    
    def __init__(self):
        self.bluebubbles = BlueBubblesIntegration()
        self.message_queue = []
    
    def setup(self, server_url=None, password=None):
        """Set up iMessage automation"""
        logger.info("Setting up BlueBubbles integration...")
        self.bluebubbles.setup_connection(server_url, password)
        logger.info("iMessage automation ready!")
    
    def send_text(self, recipient, message):
        """High-level function to send text message"""
        try:
            # Resolve recipient (handle aliases, names, etc.)
            resolved_recipient = self.bluebubbles.resolve_contact(recipient)
            
            # Send message
            result = self.bluebubbles.send_message(resolved_recipient, message)
            
            logger.info(f"✅ Text sent to {recipient} ({resolved_recipient}): {message}")
            return result
            
        except Exception as e:
            logger.error(f"❌ Failed to send text to {recipient}: {e}")
            raise
    
    def get_unread_messages(self):
        """Get unread messages (requires message monitoring)"""
        # This would require implementing WebSocket connection to monitor
        # For now, return recent messages
        return self.bluebubbles.get_recent_messages(limit=10)
    
    def add_contact_alias(self, alias, address):
        """Add a contact alias for easier messaging"""
        config = json.load(open(self.bluebubbles.config_file))
        if 'contact_aliases' not in config:
            config['contact_aliases'] = {}
        
        config['contact_aliases'][alias] = address
        self.bluebubbles.save_config(config)
        
        logger.info(f"Added contact alias: {alias} → {address}")

class BlueBubblesServer:
    """Helper class for setting up BlueBubbles server if needed"""
    
    @staticmethod
    def check_macos():
        """Check if running on macOS"""
        import platform
        return platform.system() == "Darwin"
    
    @staticmethod
    def install_bluebubbles():
        """Install BlueBubbles server (macOS only)"""
        if not BlueBubblesServer.check_macos():
            raise RuntimeError("BlueBubbles server requires macOS")
        
        print("🔵 BlueBubbles Server Installation Guide:")
        print("")
        print("1. Download BlueBubbles Server from:")
        print("   https://github.com/BlueBubblesApp/BlueBubbles-Server/releases")
        print("")
        print("2. Install and run the app")
        print("3. Follow the setup wizard:")
        print("   - Enable 'Start on Login'")
        print("   - Set a password")
        print("   - Note the server URL (usually http://localhost:1234)")
        print("")
        print("4. Grant necessary permissions:")
        print("   - Full Disk Access to BlueBubbles Server")
        print("   - Accessibility permissions")
        print("")
        print("5. Test the connection in the BlueBubbles app")
        print("")
        print("6. Return here and run: python3 imessage-integration.py")

def main():
    """Main function for testing and setup"""
    automation = iMessageAutomation()
    
    try:
        # Check if BlueBubbles server is available
        if not automation.bluebubbles.test_connection():
            if BlueBubblesServer.check_macos():
                print("❌ BlueBubbles server not found.")
                print("Would you like installation instructions? (y/n): ", end="")
                if input().lower().startswith('y'):
                    BlueBubblesServer.install_bluebubbles()
                return
            else:
                print("❌ BlueBubbles server requires macOS with iMessage access.")
                return
        
        print("🔧 Setting up iMessage integration...")
        automation.setup()
        
        # Interactive test
        print("\n📱 iMessage Integration Ready!")
        print("Enter 'help' for commands, 'quit' to exit")
        
        while True:
            command = input("\niMessage> ").strip()
            
            if command.lower() == 'quit':
                break
            elif command.lower() == 'help':
                print("Commands:")
                print("  send <recipient> <message>  - Send a text message")
                print("  contacts                    - List contacts") 
                print("  recent                      - Show recent messages")
                print("  alias <name> <address>      - Add contact alias")
                print("  quit                        - Exit")
            elif command.startswith('send '):
                parts = command[5:].split(' ', 1)
                if len(parts) >= 2:
                    recipient, message = parts[0], parts[1]
                    automation.send_text(recipient, message)
                else:
                    print("Usage: send <recipient> <message>")
            elif command == 'contacts':
                contacts = automation.bluebubbles.get_contacts()
                print(f"Found {len(contacts)} contacts:")
                for contact in contacts[:10]:  # Show first 10
                    name = contact.get('displayName', 'Unknown')
                    phones = contact.get('phoneNumbers', [])
                    phone = phones[0].get('address') if phones else 'No phone'
                    print(f"  {name}: {phone}")
            elif command == 'recent':
                messages = automation.get_unread_messages()
                print(f"Recent {len(messages)} messages:")
                for msg in messages[-5:]:  # Show last 5
                    text = msg.get('text', '')[:50]
                    sender = msg.get('handle', {}).get('address', 'Unknown')
                    print(f"  {sender}: {text}...")
            elif command.startswith('alias '):
                parts = command[6:].split(' ', 1)
                if len(parts) >= 2:
                    alias, address = parts[0], parts[1]
                    automation.add_contact_alias(alias, address)
                else:
                    print("Usage: alias <name> <address>")
            else:
                print("Unknown command. Type 'help' for available commands.")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()