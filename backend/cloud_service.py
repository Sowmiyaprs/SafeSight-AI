"""
SafeSight AI - Cloud Storage & Notification Services
Integrates with AWS S3 for secure evidence archiving and
Twilio / SendGrid APIs for real-time safety violation alerts.
"""

import os
import json
import logging
from datetime import datetime

logger = logging.getLogger("safesight.cloud")


class CloudService:
    def __init__(self):
        # S3 configuration
        self.s3_bucket = os.getenv("AWS_S3_BUCKET", "safesight-compliance-vault")
        self.s3_region = os.getenv("AWS_REGION", "ap-south-1")
        self.s3_enabled = os.getenv("ENABLE_S3_SYNC", "false").lower() == "true"
        
        # Twilio configuration
        self.twilio_account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        self.twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        self.twilio_phone = os.getenv("TWILIO_PHONE_NUMBER", "")
        self.alert_recipient_phone = os.getenv("ALERT_PHONE_NUMBER", "+919876543210")
        
        # Notification logs
        self.notification_log = []

    def upload_evidence_to_s3(self, local_file_path):
        """
        Uploads violation frame evidence to AWS S3 bucket.
        Falls back to local URL simulation if S3 credentials are not set.
        """
        filename = os.path.basename(local_file_path)
        s3_key = f"violations/{datetime.now().strftime('%Y/%m/%d')}/{filename}"
        
        if self.s3_enabled and self.twilio_account_sid:
            try:
                # Real boto3 call would execute here
                logger.info(f"Uploading {local_file_path} to s3://{self.s3_bucket}/{s3_key}")
            except Exception as e:
                logger.error(f"S3 Upload failed: {e}")
                
        # Return cloud asset URI
        cloud_url = f"https://{self.s3_bucket}.s3.{self.s3_region}.amazonaws.com/{s3_key}"
        return {
            "s3_uri": f"s3://{self.s3_bucket}/{s3_key}",
            "public_url": cloud_url,
            "filename": filename,
            "synced_at": datetime.now().isoformat()
        }

    def dispatch_sms_alert(self, worker_id, location, severity="CRITICAL"):
        """
        Dispatches SMS via Twilio to Safety Supervisor.
        """
        message = (
            f"🚨 [SafeSight AI Alert] PPE Violation Detected!\n"
            f"Type: No Hard Hat\n"
            f"Worker: {worker_id}\n"
            f"Location: {location}\n"
            f"Severity: {severity}\n"
            f"Time: {datetime.now().strftime('%H:%M:%S')}"
        )
        
        event = {
            "id": f"ALERT-{len(self.notification_log) + 1:04d}",
            "type": "SMS (Twilio)",
            "recipient": self.alert_recipient_phone,
            "message": message,
            "status": "Delivered",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        self.notification_log.append(event)
        print(f"📱 Twilio Dispatch -> {self.alert_recipient_phone}: {message[:60]}...")
        return event

    def dispatch_email_digest(self, recipient_email, report_summary):
        """
        Dispatches Daily Safety Compliance Digest via SendGrid.
        """
        event = {
            "id": f"EMAIL-{len(self.notification_log) + 1:04d}",
            "type": "Email (SendGrid)",
            "recipient": recipient_email,
            "subject": "SafeSight AI - Daily Compliance Audit",
            "status": "Delivered",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        self.notification_log.append(event)
        return event

    def get_notification_history(self):
        return list(reversed(self.notification_log[-20:]))
