#!/usr/bin/env python3
"""
OpenClaw Voice WebSocket Server
Bridges voice interface to OpenClaw message system
"""

import asyncio
import websockets
import json
import logging
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class VoiceServer:
    def __init__(self, host='localhost', port=8080):
        self.host = host
        self.port = port
        self.clients = set()
        
    async def handle_client(self, websocket, path):
        """Handle individual client connections"""
        self.clients.add(websocket)
        client_ip = websocket.remote_address[0]
        logger.info(f"Voice client connected from {client_ip}")
        
        try:
            await self.send_welcome_message(websocket)
            
            async for message in websocket:
                try:
                    data = json.loads(message)
                    await self.process_voice_message(websocket, data)
                except json.JSONDecodeError:
                    await self.send_error(websocket, "Invalid JSON format")
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
                    await self.send_error(websocket, str(e))
                    
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"Voice client {client_ip} disconnected")
        except Exception as e:
            logger.error(f"Client handler error: {e}")
        finally:
            self.clients.discard(websocket)

    async def send_welcome_message(self, websocket):
        """Send initial welcome message to connected client"""
        welcome = {
            "type": "system",
            "text": "Connected to OpenClaw Voice Assistant. How can I help you?",
            "timestamp": datetime.now().isoformat()
        }
        await websocket.send(json.dumps(welcome))

    async def process_voice_message(self, websocket, data):
        """Process incoming voice message and route to OpenClaw"""
        message_type = data.get('type')
        content = data.get('content', '')
        
        if message_type == 'voice_message':
            logger.info(f"Processing voice message: {content[:100]}...")
            
            # Route to OpenClaw via message tool
            response = await self.send_to_openclaw(content)
            
            # Send response back to client
            response_data = {
                "type": "assistant_response", 
                "text": response,
                "timestamp": datetime.now().isoformat()
            }
            await websocket.send(json.dumps(response_data))
            
        elif message_type == 'ping':
            # Health check
            pong = {"type": "pong", "timestamp": datetime.now().isoformat()}
            await websocket.send(json.dumps(pong))
            
        else:
            await self.send_error(websocket, f"Unknown message type: {message_type}")

    async def send_to_openclaw(self, message):
        """Send message to OpenClaw and get response"""
        try:
            # Use OpenClaw's exec tool to trigger a response
            # This is a simplified approach - in a full implementation,
            # we'd integrate more deeply with OpenClaw's message routing
            
            cmd = [
                'openclaw', 'message', 'send',
                '--target', 'agent:main',
                '--message', f'[VOICE] {message}'
            ]
            
            # For now, we'll create a simple response
            # In production, this would route through OpenClaw's full pipeline
            response = await self.generate_response(message)
            return response
            
        except Exception as e:
            logger.error(f"Error sending to OpenClaw: {e}")
            return "I'm sorry, I encountered an error processing your request."

    async def generate_response(self, message):
        """Generate a response using OpenClaw's capabilities"""
        try:
            # Try to use OpenClaw CLI for response generation
            cmd = ['openclaw', 'ask', '--no-history', '--', message]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                return stdout.decode().strip()
            else:
                logger.error(f"OpenClaw command failed: {stderr.decode()}")
                return await self.fallback_response(message)
                
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return await self.fallback_response(message)

    async def fallback_response(self, message):
        """Fallback response when OpenClaw is unavailable"""
        # Simple rule-based responses for common patterns
        message_lower = message.lower()
        
        if 'hello' in message_lower or 'hi' in message_lower:
            return "Hello! I'm your OpenClaw voice assistant. How can I help you today?"
            
        elif 'time' in message_lower:
            now = datetime.now()
            return f"It's currently {now.strftime('%I:%M %p on %A, %B %d')}."
            
        elif 'weather' in message_lower:
            return "I'd be happy to check the weather for you. Let me get that information."
            
        elif 'email' in message_lower:
            return "I can help you with email management. What would you like me to do?"
            
        elif 'text' in message_lower or 'message' in message_lower:
            return "I can help you send text messages. Who would you like to message?"
            
        else:
            return "I understand you're asking about: " + message + ". Let me help you with that."

    async def send_error(self, websocket, error_message):
        """Send error message to client"""
        error_data = {
            "type": "error",
            "message": error_message,
            "timestamp": datetime.now().isoformat()
        }
        await websocket.send(json.dumps(error_data))

    async def broadcast_to_clients(self, message):
        """Broadcast message to all connected clients"""
        if self.clients:
            disconnected = set()
            
            for client in self.clients:
                try:
                    await client.send(json.dumps(message))
                except websockets.exceptions.ConnectionClosed:
                    disconnected.add(client)
            
            # Remove disconnected clients
            self.clients -= disconnected

    async def start_server(self):
        """Start the WebSocket server"""
        logger.info(f"Starting Voice WebSocket server on {self.host}:{self.port}")
        
        async with websockets.serve(self.handle_client, self.host, self.port):
            logger.info("Voice server is running. Press Ctrl+C to stop.")
            await asyncio.Future()  # Run forever

def main():
    """Main entry point"""
    try:
        server = VoiceServer()
        asyncio.run(server.start_server())
    except KeyboardInterrupt:
        logger.info("Voice server shutting down...")
    except Exception as e:
        logger.error(f"Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()