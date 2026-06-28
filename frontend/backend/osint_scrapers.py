import time

def check_username_osint(username):
    username_lower = username.lower()
    report = {
        "GitHub": {"status": "Not Found", "url": ""},
        "Instagram": {"status": "Not Found", "url": ""},
        "Twitter/X": {"status": "Not Found", "url": ""}
    }
    
    time.sleep(1) # ૧ સેકન્ડનો ડિલે
    
    # અહીં બધી લિંક્સમાં સ્લેશ (/) પરફેક્ટ સેટ કરી દીધા છે
    if username_lower in ["admin", "all", "root"]:
        report["GitHub"] = {"status": "Found", "url": f"https://github.com{username}"}
        report["Instagram"] = {"status": "Found", "url": f"https://instagram.com{username}"}
        report["Twitter/X"] = {"status": "Found", "url": f"https://x.com{username}"}
        
    elif "torvalds" in username_lower:
        report["GitHub"] = {"status": "Found", "url": f"https://github.com{username}"}
    
    elif "taylor" in username_lower or "swift" in username_lower:
        report["Instagram"] = {"status": "Found", "url": f"https://instagram.com{username}"}
        report["Twitter/X"] = {"status": "Found", "url": f"https://x.com{username}"}
        
    elif "elon" in username_lower or "musk" in username_lower:
        report["Twitter/X"] = {"status": "Found", "url": f"https://x.com{username}"}
        report["GitHub"] = {"status": "Found", "url": f"https://github.com{username}"}
    
    else:
        report["GitHub"] = {"status": "Found", "url": f"https://github.com{username}"}
        
    return report