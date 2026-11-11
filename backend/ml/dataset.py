import csv
from pathlib import Path

# Label 0: Legitimate (Ham)
# Label 1: Fraud / Scam (Phishing, Smishing, Malicious)

RAW_DATASET = [
    # --- LEGITIMATE MESSAGES (Label 0) ---
    {"text": "Hey, are you free this evening? Let's catch up for coffee around 5 PM.", "label": 0, "category": "personal"},
    {"text": "Mom asked if you reached the college safely. Let us know once you arrive.", "label": 0, "category": "personal"},
    {"text": "Hi Rahul, can you please review the presentation slides for tomorrow's team meeting?", "label": 0, "category": "work"},
    {"text": "Happy birthday! Wishing you a wonderful year ahead filled with happiness and success.", "label": 0, "category": "personal"},
    {"text": "Don't forget to submit the assignment before 11:59 PM today on Google Classroom.", "label": 0, "category": "academic"},
    {"text": "Can you share the lecture notes from today's computer networks class? Thanks!", "label": 0, "category": "academic"},
    {"text": "Dinner is ready. Come down when you take a break from studying.", "label": 0, "category": "personal"},
    {"text": "The doctor's appointment is confirmed for Thursday at 4:30 PM at Apollo Clinic.", "label": 0, "category": "personal"},
    {"text": "Running late by 10 minutes due to traffic. Start the discussion, I will join shortly.", "label": 0, "category": "work"},
    {"text": "Thanks for helping me fix the code bug earlier today. Appreciate it!", "label": 0, "category": "personal"},

    # Legitimate Banking & Transactions
    {"text": "Dear Customer, INR 1,250.00 debited from A/c XX4821 on 10-NOV-24 at SMART BAZAAR POS. Avail Bal: INR 24,180.00. - State Bank of India", "label": 0, "category": "banking"},
    {"text": "Dear Customer, INR 35,000.00 credited to A/c XX9012 on 01-NOV-24 by SALARY TRANSFER from INFOSYS LTD. Total Bal: INR 42,900.00. - HDFC Bank", "label": 0, "category": "banking"},
    {"text": "Your A/c XX3145 has been debited with INR 450.00 on 08-NOV-24 towards Netflix Subscription. If not done by you, call 18002586161. - ICICI Bank", "label": 0, "category": "banking"},
    {"text": "Interest of INR 182.00 credited to Savings A/c XX7721 for Q2. - Axis Bank", "label": 0, "category": "banking"},
    {"text": "ATM Cash Withdrawal of INR 2,000.00 from A/c XX6123 at KORAMANGALA ATM on 09-NOV-24. - Canara Bank", "label": 0, "category": "banking"},

    # Legitimate OTPs with security warning
    {"text": "583921 is your OTP for logging into Swiggy. Valid for 5 minutes. DO NOT share OTP with anyone, including delivery partners.", "label": 0, "category": "otp"},
    {"text": "394810 is your secret OTP for authenticating IRCTC ticket booking. Do not disclose this OTP to anyone. IRCTC never asks for OTP.", "label": 0, "category": "otp"},
    {"text": "Your Amazon verification code is 849201. Don't share this code with anyone. Amazon employees will never ask for your code.", "label": 0, "category": "otp"},
    {"text": "918234 is your OTP for Aadhaar authentication at EPFO portal. Valid for 10 minutes. - UIDAI", "label": 0, "category": "otp"},
    {"text": "Use OTP 726194 to approve payment of INR 850.00 at Zomato. Never share OTP or PIN with anyone. - SBI Card", "label": 0, "category": "otp"},

    # Legitimate Utility, Delivery & Government
    {"text": "Dear Consumer, your BESCOM electricity bill for CA 10293847 is INR 780. Due date is 18-NOV-24. Pay online at bescom.karnataka.gov.in", "label": 0, "category": "utility"},
    {"text": "Your Airtel fiber broadband bill for account 080412389 is INR 943.90. Auto-pay scheduled on 15-NOV-24 via HDFC credit card.", "label": 0, "category": "utility"},
    {"text": "Your package with tracking number BD92847192 has been delivered to your front desk. Signed by Security. - Blue Dart Express", "label": 0, "category": "delivery"},
    {"text": "Order #403-9284729-1928374 has shipped via Delhivery. Track package status inside the Flipkart application.", "label": 0, "category": "delivery"},
    {"text": "PNR 4829104920, Train 12658 CHENNAI MAIL, Date 14-NOV, Class 3A, Confirmed Coach B3 Berth 21. Wishing you a pleasant journey. - IRCTC", "label": 0, "category": "travel"},
    {"text": "Public Health Advisory: Get seasonal flu immunization for elderly family members at nearest BBMP urban primary clinic. - Health Dept", "label": 0, "category": "govt"},
    {"text": "Your vehicle KA01MJ4928 fastag toll of INR 65.00 deducted at Devanahalli Toll Plaza. Available balance INR 340.00. - NETC", "label": 0, "category": "utility"},
    {"text": "LPG Cylinder booked against Consumer No. 928471. Estimated delivery within 2 working days. Subsidy applicable. - Indane Gas", "label": 0, "category": "utility"},
    {"text": "Dear user, you have consumed 50% of your daily high-speed data limit of 2.00 GB. Recharge anytime on MyJio app. - Jio", "label": 0, "category": "utility"},
    {"text": "Reminder: Your dental checkup is scheduled tomorrow at 11 AM at Whitefield Dental Clinic. Reply 1 to confirm or 2 to reschedule.", "label": 0, "category": "personal"},

    # --- FRAUD / SCAM MESSAGES (Label 1) ---
    # 1. Fake KYC / Account Suspension Urgency
    {"text": "URGENT NOTICE: Your SBI account is blocked today due to pending PAN KYC! Update immediately at http://sbi-kyc-pan-update.xyz or funds will be seized.", "label": 1, "category": "fake_kyc"},
    {"text": "Dear HDFC customer, your net banking access is suspended within 24 hours. Click http://hdfc-netverify.com/login to submit your Aadhaar and PAN.", "label": 1, "category": "fake_kyc"},
    {"text": "Important alert: Your ICICI Debit Card has expired. Verify your 16 digit card number, CVV and ATM PIN here to avoid deactivation: http://icici-card-portal.top", "label": 1, "category": "fake_kyc"},
    {"text": "Attention: Your Bank of Baroda account has been frozen due to non-verification of documents. Re-activate by entering OTP at http://bob-reactivate.club", "label": 1, "category": "fake_kyc"},
    {"text": "PNB Alert: Your bank account will be closed permanently tonight at 8 PM. Download and install KYC APK immediately: http://192.168.1.105/pnb.apk", "label": 1, "category": "fake_kyc"},

    # 2. OTP / Credential Theft Scams
    {"text": "Dear Customer, an unauthorized transaction of Rs 49,999 is initiated on your credit card. To cancel this transaction, share OTP with executive or call 9876543210 immediately.", "label": 1, "category": "otp_theft"},
    {"text": "Security Alert: Someone in Nigeria attempted to login to your Google/Gmail account. Verify your identity by sharing the 6 digit code received on your phone now.", "label": 1, "category": "otp_theft"},
    {"text": "RBI verification: To prevent tax penalty on your bank account, send your 4-digit UPI PIN and last OTP to WhatsApp number 9988776655.", "label": 1, "category": "otp_theft"},
    {"text": "Amazon support: We detected suspicious purchase of iPhone 15 on your account. Send us the OTP you received to stop delivery and process full refund.", "label": 1, "category": "otp_theft"},
    {"text": "Dear SBI user, refund of Rs 8,450 is pending. Click http://sbi-refund.link and enter your ATM card PIN and CVV to claim into your account.", "label": 1, "category": "otp_theft"},

    # 3. UPI / Money Request & QR Code Scams
    {"text": "Congratulations! You have received a cash cashback of Rs 4,500 from Google Pay scratch card. Click here and enter UPI PIN to receive money: upi://pay?pa=scam@okaxis", "label": 1, "category": "upi_scam"},
    {"text": "PhonePe Reward: You won Diwali Lucky Bonus of Rs 50,000! Scan this QR code and approve request in PhonePe to transfer prize to your bank.", "label": 1, "category": "upi_scam"},
    {"text": "Paytm Alert: Your Paytm wallet KYC is incomplete. Click http://paytm-kyc-wallet.info and approve pending payment of Rs 1 to receive Rs 10,000 voucher.", "label": 1, "category": "upi_scam"},
    {"text": "Buyer on OLX: I have sent Rs 15,000 for your furniture. Please scan this merchant QR code and enter your UPI PIN to accept the funds into your bank.", "label": 1, "category": "upi_scam"},
    {"text": "Cred Cash Prize: You have been selected for Rs 25,000 instant cashback. Click upi://pay?pa=cashback@upi to receive funds directly.", "label": 1, "category": "upi_scam"},

    # 4. Fake Work From Home / Part-Time Job Scams
    {"text": "Part-Time Job Offer: Earn Rs 3,000 to Rs 8,000 daily from home! Simply like YouTube videos and submit screenshots. Contact HR manager on WhatsApp: +91-9123456780", "label": 1, "category": "fake_job"},
    {"text": "Hiring remote workers for Amazon product review task! Daily payout Rs 2,500-5,000. No experience needed. Join Telegram group now: https://t.me/amazon_job_daily", "label": 1, "category": "fake_job"},
    {"text": "Google Maps Review Job: Earn Rs 150 per review rating. Daily earnings credited instantly via UPI. Contact Ms. Priya on Telegram @GoogleReviewTasks", "label": 1, "category": "fake_job"},
    {"text": "Global Crypto Trading: Deposit Rs 1,000 and get guaranteed return of Rs 10,000 within 2 hours! 100% risk free trading. Register: http://crypto-doubler.top", "label": 1, "category": "fake_job"},
    {"text": "Work from home typing job! Earn Rs 30,000 per month. Pay registration security deposit of Rs 1,500 to receive assignment material. Call 9876543211", "label": 1, "category": "fake_job"},

    # 5. Electricity / Utility Disconnection Scam
    {"text": "URGENT ELECTRICITY ALERT: Dear consumer, your electricity power will be disconnected tonight at 9:30 PM from power office because your previous month bill was not updated. Call electricity officer immediately at 9123498765.", "label": 1, "category": "utility_scam"},
    {"text": "Notice from Power Board: Your electric meter connection is scheduled for cutoff within 2 hours due to unpaid dues. Pay Rs 10 to officer phone number 9988771122 to stop disconnection.", "label": 1, "category": "utility_scam"},
    {"text": "Gas pipeline alert: Your domestic PNG connection will be disconnected today. Download QuickSupport app and call technician 9876543200 for instant restoration.", "label": 1, "category": "utility_scam"},

    # 6. Delivery / Courier Address & Fee Scam
    {"text": "India Post Alert: Your parcel #IN849204 could not be delivered due to incomplete street address. Update your address within 12 hours and pay Rs 25 redelivery fee: http://indiapost-update.top", "label": 1, "category": "delivery_scam"},
    {"text": "DHL Express: Package #928471 arrived at customs but is detained. Pay import duty clearance fee of Rs 499 at http://dhl-customs-clearance.xyz or parcel will be destroyed.", "label": 1, "category": "delivery_scam"},
    {"text": "FedEx Delivery failed: Delivery agent could not contact you. Reschedule delivery date by clicking: http://fedex-redelivery-portal.site/confirm", "label": 1, "category": "delivery_scam"},

    # 7. Lottery, Lucky Draw & Prize Scams
    {"text": "KBC WhatsApp Lucky Draw: Congratulations! Your SIM card number has won Rs 25,00,000 in Kaun Banega Crorepati mega draw. Call KBC Manager Rana Pratap on WhatsApp +91-9876543299 to claim check.", "label": 1, "category": "lottery"},
    {"text": "Dear customer, you have won a brand new Tata Safari car in Car Dekho festival contest! Pay delivery registration tax of Rs 12,500 to dispatch vehicle. WhatsApp 8877665544", "label": 1, "category": "lottery"},
    {"text": "Coca-Cola Promo 2024: Your email won 500,000 GBP in international lucky draw! Reply with full name, passport copy, bank details to claim prize.", "label": 1, "category": "lottery"},

    # 8. Digital Arrest / Law Enforcement Impersonation Scam
    {"text": "CBI & Mumbai Cyber Crime Police: An illegal parcel with narcotics and counterfeit passports linked to your Aadhaar card has been seized. Connect to officer via WhatsApp video call immediately or face immediate arrest warrant.", "label": 1, "category": "digital_arrest"},
    {"text": "Supreme Court of India: High court summons issued against your name regarding financial money laundering case. Download legal notice PDF from http://court-summons-notice.xyz", "label": 1, "category": "digital_arrest"},
    {"text": "TRAI Notice: Your mobile connection will be blocked within 2 hours by telecom authority due to cyber crime involvement. Press 9 to speak with police investigation officer.", "label": 1, "category": "digital_arrest"},

    # 9. Fake SIM Upgrade / 5G Tower / Loan Scam
    {"text": "Jio 5G Upgrade: Convert your 4G SIM to 5G VIP plan for FREE with lifetime free data. Forward this message with OTP to 9876543210 to activate instantly.", "label": 1, "category": "sim_scam"},
    {"text": "Instant Personal Loan sanctioned! Rs 5,00,000 approved at 1% interest rate without salary slip or CIBIL check. Click http://quickloan-approval.online to transfer money to your account.", "label": 1, "category": "loan_scam"}
]

def export_dataset_to_csv(filepath: str | Path):
    """Save dataset to CSV for external inspection, research analysis, or training."""
    path = Path(filepath)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["text", "label", "category"])
        writer.writeheader()
        writer.writerows(RAW_DATASET)
    return str(path)

def load_dataset():
    """Returns list of dicts with 'text', 'label', 'category'."""
    return RAW_DATASET
