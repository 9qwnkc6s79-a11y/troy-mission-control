#!/usr/bin/env python3
"""
OpenClaw Communication Test Suite
Tests all Phase 1 communication capabilities:
- Voice Assistant (WebSocket + HTML interface)
- Gmail Integration (OAuth + email processing)
- iMessage Integration (BlueBubbles)
"""

import sys
import json
import time
import logging
import asyncio
import subprocess
from pathlib import Path
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CommunicationTester:
    def __init__(self):
        self.test_results = {
            'voice': {'status': 'pending', 'details': []},
            'email': {'status': 'pending', 'details': []},
            'imessage': {'status': 'pending', 'details': []},
            'overall': {'status': 'pending', 'score': 0}
        }
        self.start_time = datetime.now()
        
    def log_test(self, component, test_name, success, message=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        logger.info(f"{component.upper()} - {test_name}: {status} {message}")
        
        self.test_results[component]['details'].append({
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat()
        })
        
        # Update component status
        component_tests = self.test_results[component]['details']
        if all(t['success'] for t in component_tests):
            self.test_results[component]['status'] = 'passed'
        elif any(not t['success'] for t in component_tests):
            self.test_results[component]['status'] = 'failed'
    
    async def test_voice_assistant(self):
        """Test voice assistant functionality"""
        logger.info("🎙️  Testing Voice Assistant...")
        
        # Test 1: Check voice-assistant.html exists
        html_file = Path("voice-assistant.html")
        if html_file.exists():
            self.log_test('voice', 'HTML Interface', True, "voice-assistant.html found")
        else:
            self.log_test('voice', 'HTML Interface', False, "voice-assistant.html missing")
            return
        
        # Test 2: Check voice-server.py exists and is executable
        server_file = Path("voice-server.py")
        if server_file.exists() and server_file.stat().st_mode & 0o111:
            self.log_test('voice', 'Server Script', True, "voice-server.py ready")
        else:
            self.log_test('voice', 'Server Script', False, "voice-server.py missing or not executable")
        
        # Test 3: Check Python dependencies
        try:
            import websockets
            self.log_test('voice', 'Dependencies', True, "websockets library available")
        except ImportError:
            self.log_test('voice', 'Dependencies', False, "websockets library missing")
        
        # Test 4: Try to start server briefly
        try:
            process = subprocess.Popen([
                sys.executable, 'voice-server.py'
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            # Give it a moment to start
            await asyncio.sleep(2)
            
            # Check if still running
            if process.poll() is None:
                self.log_test('voice', 'Server Startup', True, "WebSocket server starts successfully")
                process.terminate()
                process.wait()
            else:
                stdout, stderr = process.communicate()
                error = stderr.decode()[:200]
                self.log_test('voice', 'Server Startup', False, f"Server failed: {error}")
        except Exception as e:
            self.log_test('voice', 'Server Startup', False, f"Exception: {str(e)[:100]}")
        
        # Test 5: Check startup script
        start_script = Path("start-voice.sh")
        if start_script.exists() and start_script.stat().st_mode & 0o111:
            self.log_test('voice', 'Startup Script', True, "start-voice.sh ready")
        else:
            self.log_test('voice', 'Startup Script', False, "start-voice.sh missing or not executable")
    
    def test_email_integration(self):
        """Test email integration"""
        logger.info("📧 Testing Email Integration...")
        
        # Test 1: Check email-integration.py exists
        email_file = Path("email-integration.py")
        if email_file.exists():
            self.log_test('email', 'Script File', True, "email-integration.py found")
        else:
            self.log_test('email', 'Script File', False, "email-integration.py missing")
            return
        
        # Test 2: Check Google API dependencies
        try:
            from google.auth.transport.requests import Request
            from google.oauth2.credentials import Credentials
            from google_auth_oauthlib.flow import InstalledAppFlow
            from googleapiclient.discovery import build
            self.log_test('email', 'Dependencies', True, "Google API libraries available")
        except ImportError as e:
            missing = str(e).split("'")[1] if "'" in str(e) else "unknown"
            self.log_test('email', 'Dependencies', False, f"Missing: {missing}")
        
        # Test 3: Check configuration directory
        config_dir = Path.home() / ".openclaw"
        if config_dir.exists():
            self.log_test('email', 'Config Directory', True, f"{config_dir} exists")
        else:
            self.log_test('email', 'Config Directory', False, f"{config_dir} missing")
        
        # Test 4: Check for OAuth credentials
        client_secret = config_dir / "client_secret.json"
        if client_secret.exists():
            self.log_test('email', 'OAuth Credentials', True, "client_secret.json found")
        else:
            self.log_test('email', 'OAuth Credentials', False, "client_secret.json missing - see GMAIL_SETUP.md")
        
        # Test 5: Check setup guide
        setup_guide = Path("GMAIL_SETUP.md")
        if setup_guide.exists():
            self.log_test('email', 'Setup Guide', True, "GMAIL_SETUP.md available")
        else:
            self.log_test('email', 'Setup Guide', False, "GMAIL_SETUP.md missing")
        
        # Test 6: Test email script execution
        try:
            result = subprocess.run([
                sys.executable, 'email-integration.py', '--test-import'
            ], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                self.log_test('email', 'Script Execution', True, "Script runs without errors")
            else:
                error = result.stderr[:200]
                self.log_test('email', 'Script Execution', False, f"Script error: {error}")
        except subprocess.TimeoutExpired:
            self.log_test('email', 'Script Execution', False, "Script execution timeout")
        except Exception as e:
            self.log_test('email', 'Script Execution', False, f"Exception: {str(e)[:100]}")
    
    def test_imessage_integration(self):
        """Test iMessage integration"""
        logger.info("📱 Testing iMessage Integration...")
        
        # Test 1: Check platform (macOS required for BlueBubbles)
        import platform
        if platform.system() == "Darwin":
            self.log_test('imessage', 'Platform Check', True, "Running on macOS")
        else:
            self.log_test('imessage', 'Platform Check', False, f"Running on {platform.system()}, macOS required")
        
        # Test 2: Check imessage-integration.py exists
        imessage_file = Path("imessage-integration.py")
        if imessage_file.exists():
            self.log_test('imessage', 'Script File', True, "imessage-integration.py found")
        else:
            self.log_test('imessage', 'Script File', False, "imessage-integration.py missing")
            return
        
        # Test 3: Check dependencies
        try:
            import requests
            self.log_test('imessage', 'Dependencies', True, "requests library available")
        except ImportError:
            self.log_test('imessage', 'Dependencies', False, "requests library missing")
        
        # Test 4: Check BlueBubbles server availability
        try:
            import requests
            response = requests.get("http://localhost:1234/api/v1/server/info", timeout=3)
            if response.status_code == 200:
                self.log_test('imessage', 'BlueBubbles Server', True, "BlueBubbles server responding")
            else:
                self.log_test('imessage', 'BlueBubbles Server', False, f"Server returned {response.status_code}")
        except requests.exceptions.ConnectionError:
            self.log_test('imessage', 'BlueBubbles Server', False, "BlueBubbles server not running - see BLUEBUBBLES_SETUP.md")
        except Exception as e:
            self.log_test('imessage', 'BlueBubbles Server', False, f"Connection error: {str(e)[:100]}")
        
        # Test 5: Check setup guide
        setup_guide = Path("BLUEBUBBLES_SETUP.md")
        if setup_guide.exists():
            self.log_test('imessage', 'Setup Guide', True, "BLUEBUBBLES_SETUP.md available")
        else:
            self.log_test('imessage', 'Setup Guide', False, "BLUEBUBBLES_SETUP.md missing")
        
        # Test 6: Check Messages app (macOS only)
        if platform.system() == "Darwin":
            try:
                result = subprocess.run([
                    'osascript', '-e', 'tell application "Messages" to get name'
                ], capture_output=True, text=True, timeout=5)
                
                if result.returncode == 0:
                    self.log_test('imessage', 'Messages App', True, "Messages app accessible")
                else:
                    self.log_test('imessage', 'Messages App', False, "Messages app not accessible")
            except Exception as e:
                self.log_test('imessage', 'Messages App', False, f"Exception: {str(e)[:100]}")
    
    def calculate_overall_score(self):
        """Calculate overall completion score"""
        total_tests = 0
        passed_tests = 0
        
        for component in ['voice', 'email', 'imessage']:
            component_tests = self.test_results[component]['details']
            total_tests += len(component_tests)
            passed_tests += sum(1 for t in component_tests if t['success'])
        
        if total_tests > 0:
            score = int((passed_tests / total_tests) * 100)
            self.test_results['overall']['score'] = score
            
            if score >= 90:
                self.test_results['overall']['status'] = 'excellent'
            elif score >= 75:
                self.test_results['overall']['status'] = 'good'
            elif score >= 50:
                self.test_results['overall']['status'] = 'partial'
            else:
                self.test_results['overall']['status'] = 'needs_work'
    
    def print_summary(self):
        """Print test summary"""
        self.calculate_overall_score()
        
        print("\n" + "="*60)
        print("🚀 OPENCLAW PHASE 1 COMMUNICATION TEST RESULTS")
        print("="*60)
        
        # Overall score
        score = self.test_results['overall']['score']
        status = self.test_results['overall']['status']
        
        status_emoji = {
            'excellent': '🎉',
            'good': '✅', 
            'partial': '⚠️',
            'needs_work': '❌'
        }
        
        print(f"\n{status_emoji.get(status, '❓')} OVERALL SCORE: {score}% ({status.upper()})")
        
        # Component summaries
        for component in ['voice', 'email', 'imessage']:
            comp_data = self.test_results[component]
            tests = comp_data['details']
            
            passed = sum(1 for t in tests if t['success'])
            total = len(tests)
            comp_status = comp_data['status']
            
            emoji = '✅' if comp_status == 'passed' else '⚠️' if passed > 0 else '❌'
            
            print(f"\n{emoji} {component.upper()}: {passed}/{total} tests passed")
            
            # Show failed tests
            failed_tests = [t for t in tests if not t['success']]
            if failed_tests:
                for test in failed_tests:
                    print(f"   ❌ {test['test']}: {test['message']}")
        
        # Next steps
        print("\n" + "-"*60)
        print("📋 NEXT STEPS:")
        
        if score >= 90:
            print("🎉 Excellent! All communication capabilities are ready.")
            print("   Run: ./start-voice.sh to begin using the voice assistant")
        elif score >= 75:
            print("✅ Good progress! Most features are working.")
            print("   Address the failed tests above for full functionality")
        elif score >= 50:
            print("⚠️  Partial setup. Key features need attention.")
            print("   Focus on the failed tests to complete setup")
        else:
            print("❌ Setup needs work. Follow the setup guides:")
            print("   - GMAIL_SETUP.md for email integration")
            print("   - BLUEBUBBLES_SETUP.md for iMessage integration")
        
        print("\n📚 Documentation:")
        print("   - voice-assistant.html - Voice interface")
        print("   - GMAIL_SETUP.md - Email setup guide")
        print("   - BLUEBUBBLES_SETUP.md - iMessage setup guide")
        
        elapsed = datetime.now() - self.start_time
        print(f"\n⏱️  Test completed in {elapsed.total_seconds():.1f} seconds")
        print("="*60)
    
    def save_results(self):
        """Save test results to file"""
        results_file = Path("communication-test-results.json")
        with open(results_file, 'w') as f:
            json.dump(self.test_results, f, indent=2)
        
        logger.info(f"Results saved to {results_file}")

async def main():
    """Main test runner"""
    print("🚀 Starting OpenClaw Phase 1 Communication Test Suite...")
    print("   Testing: Voice Assistant, Email Integration, iMessage Control")
    
    tester = CommunicationTester()
    
    try:
        # Run all tests
        await tester.test_voice_assistant()
        tester.test_email_integration()
        tester.test_imessage_integration()
        
        # Print results
        tester.print_summary()
        tester.save_results()
        
    except KeyboardInterrupt:
        print("\n❌ Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Test suite error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Add test mode for email script
    if len(sys.argv) > 1 and sys.argv[1] == '--test-import':
        try:
            from email_integration import EmailAutomation
            print("Email integration imports successful")
            sys.exit(0)
        except ImportError as e:
            print(f"Import error: {e}", file=sys.stderr)
            sys.exit(1)
    
    # Run main test suite
    asyncio.run(main())