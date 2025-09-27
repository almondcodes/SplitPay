import os
from django.conf import settings


class SMSService:
    def __init__(self):
        self.africastalking_sms = None
        self.twilio_client = None
        self.initialized = False
        self.provider = None
    
    def _initialize(self):
        """Lazy initialization of SMS service - initialize both providers"""
        if self.initialized:
            return
            
        # Try Africa's Talking first
        africastalking_key = os.getenv('AFRICASTALKING_API_KEY', '')
        if africastalking_key:
            try:
                import africastalking
                username = os.getenv('AFRICASTALKING_USERNAME', 'sandbox')
                
                # Initialize only SMS service, not WhatsApp
                africastalking.initialize(username, africastalking_key)
                self.africastalking_sms = africastalking.SMS
                self.provider = 'africastalking'
                print("Africa's Talking SMS service initialized successfully")
                
            except Exception as e:
                print(f"Failed to initialize Africa's Talking SMS: {e}")
        
        # Always try to initialize Twilio as fallback
        twilio_sid = os.getenv('TWILIO_ACCOUNT_SID', '')
        twilio_token = os.getenv('TWILIO_AUTH_TOKEN', '')
        twilio_from = os.getenv('TWILIO_FROM_NUMBER', '')
        
        if twilio_sid and twilio_token and twilio_from:
            try:
                from twilio.rest import Client
                self.twilio_client = Client(twilio_sid, twilio_token)
                print("Twilio SMS service initialized successfully")
                
            except Exception as e:
                print(f"Failed to initialize Twilio SMS: {e}")
        
        # Check if at least one provider is available
        if not self.africastalking_sms and not self.twilio_client:
            print("No SMS provider available. SMS will not be sent.")
        
        self.initialized = True

    def send_otp(self, phone_number: str, code: str) -> bool:
        """
        Send OTP via SMS using available provider
        """
        self._initialize()
        
        if not self.provider:
            print("SMS service not available")
            return False
            
        message = f"Your PesaSplit verification code is: {code}. Valid for 5 minutes."
        
        try:
            if self.provider == 'africastalking' and self.africastalking_sms:
                # Send via Africa's Talking
                print(f"Attempting to send SMS to {phone_number}")
                response = self.africastalking_sms.send(message, [phone_number])
                print(f"Africa's Talking response: {response}")
                
                # Handle different response structures
                if 'SMSMessageData' in response:
                    recipients = response['SMSMessageData'].get('Recipients', [])
                    if recipients:
                        recipient = recipients[0]
                        status_code = recipient.get('statusCode')
                        status = recipient.get('status', 'unknown')
                        print(f"Recipient status: {status_code} - {status}")
                        
                        if status_code == 101:  # Success
                            return True
                        elif status_code == 406:  # UserInBlacklist
                            print("Phone number blacklisted in Africa's Talking, falling back to Twilio...")
                            # Fall back to Twilio
                            if self.twilio_client:
                                from_number = os.getenv('TWILIO_FROM_NUMBER', '')
                                if from_number:
                                    print(f"Sending SMS via Twilio to {phone_number}")
                                    message_obj = self.twilio_client.messages.create(
                                        body=message,
                                        from_=from_number,
                                        to=phone_number
                                    )
                                    print(f"Twilio message status: {message_obj.status}")
                                    return message_obj.status in ['queued', 'sending', 'sent']
                                else:
                                    print("TWILIO_FROM_NUMBER not set")
                            else:
                                print("Twilio client not available")
                            return False
                        else:
                            print(f"Africa's Talking failed with status: {status_code} - {status}")
                            return False
                    else:
                        print("No recipients in response")
                        return False
                else:
                    print(f"Unexpected response structure: {response}")
                    return False
                    
            elif self.provider == 'twilio' and self.twilio_client:
                # Send via Twilio
                from_number = os.getenv('TWILIO_FROM_NUMBER', '')
                message_obj = self.twilio_client.messages.create(
                    body=message,
                    from_=from_number,
                    to=phone_number
                )
                return message_obj.status in ['queued', 'sending', 'sent']
                
        except Exception as e:
            print(f"SMS sending failed: {e}")
            import traceback
            traceback.print_exc()
            
        return False
        
# Global SMS service instance
sms_service = SMSService()
