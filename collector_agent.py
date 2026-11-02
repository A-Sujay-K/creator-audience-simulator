# Start of bot code
# ParallelProduction
# ParallelTemplate

import time
import json
import requests
import base64
import uuid
import sys
import os

Sessionid = ''
username = ''
MobileNumber = ''
forumID = os.getenv('BRIDGE_FORUM_ID', 'c3c39aaf-8de7-40b8-a744-b410543d6a58')
botUserName = os.getenv('BRIDGE_DEVICE_USER', '@uuidacd3f7aa35cf474ba37f23e4b1528643')
serverID = os.getenv('BRIDGE_SERVER_ID', 'c9b6722d-5dbf-4b4f-a28e-692b4d26c1cf-7870eb8e-2f45-458a-9a70-d6b2d71ee871')
templateID = 'b5ce3f2d-25ff-58d4-9faa-c81f4756aee4'
adminFile = 'ParallelProduction_ParallelTemplate_Admin.txt'

# ── Local API endpoints ───────────────────────────────────────────────────────
API = "http://localhost:8000"


def go():
    try:
        print(f"[Bot] Starting ParallelCollector for forum: {forumID}")
        login()
        while True:
            clienntSync()
            time.sleep(10)
    except KeyboardInterrupt:
        print("\n[Bot] Collector stopped by user.")
    except Exception as e:
        print(f"[Bot] Fatal error: {e}")
        return e


# ── Login ─────────────────────────────────────────────────────────────────────

def login():
    try:
        global Sessionid
        global username
        global MobileNumber
        global forumID
        tempJson = {
            "MACAddress": 'Bridge-Web',
            "UserName": botUserName,
            "Password": base64.b64decode('Q29zbWl0dWRlQnJpZGdlRGV2aWNl').decode('UTF-8'),
            "ServerID": serverID
        }
        headers = {'Content-Type': 'application/json'}
        variab = json.dumps(tempJson)
        response = requests.post('https://ca.cosmitude.com/loginForDevice', data=variab, headers=headers, timeout=600)
        strData = str(response.text)
        respJson = json.loads(strData)
        Sessionid = respJson['ErrorMessage']['SessionID']
        countryCode = respJson['ErrorMessage'].get('CountryCode', '')
        MobileNumber = countryCode + respJson['ErrorMessage'].get('MobileNumber', '')
        print(f"[Bot] Logged in successfully. Mobile: {MobileNumber}")
        getForumDetails()
    except Exception as e:
        print(f"[Bot] Login error: {e}")
        return e


# ── Forum Details ─────────────────────────────────────────────────────────────

def getForumDetails():
    try:
        tempJson = {
            "MACAddress": 'Bridge-Web',
            "ForumID": forumID,
            "SessionID": Sessionid,
            "ServerID": serverID
        }
        headers = {'Content-Type': 'application/json'}
        variab = json.dumps(tempJson)
        response = requests.post('https://ca.cosmitude.com/getRequestedForumDetails', data=variab, headers=headers, timeout=600)
        if response.status_code == 200:
            responseStr = str(response.text)
            respJson = json.loads(responseStr)
            errorCode = respJson['ErrorCode']
            if errorCode == 1172:
                errorMsg = respJson['ErrorMessage']
                forumDetails = errorMsg['ForumDataArray']
                for singleForum in forumDetails:
                    singleForumDetails = singleForum[forumID]
                    saveForumDetails = singleForumDetails['NewForumJsonData']
                    with open(adminFile, 'w', encoding='utf-8') as f:
                        json.dump(saveForumDetails, f, indent=2)
                print(f"[Bot] Forum template details saved to {adminFile} [OK]")
    except Exception as e:
        print(f"[Bot] getForumDetails error: {e}")
        return e


# ── Client Sync ───────────────────────────────────────────────────────────────

def clienntSync():
    try:
        clientSyncJson = {
            "SessionID": Sessionid,
            "MACAddress": 'Bridge-Web',
            "ServerID": serverID,
            "ServerName": 'Bridge'
        }
        headers = {'Content-Type': 'application/json'}
        variab = json.dumps(clientSyncJson)
        response = requests.post('https://ca.cosmitude.com/syncUserData', data=variab, headers=headers, timeout=600)
        strData = str(response.text)
        dataRead = json.loads(strData)
        syncData = dataRead.get('ErrorMessage', {}).get('Admin', [])
        
        if syncData:
            for data in syncData:
                if 'Bridge' in data:
                    bridgeData = data['Bridge']
                    flowName = bridgeData.get('FlowID', '')
                    mNumber = bridgeData.get('MobileNumber', '')

                    # ── Step 1: Log incoming flow ──
                    print(f"[sync] Incoming flow: {flowName}")

                    # ── Step 2: Always forward incoming bridge to local ingest service ──
                    try:
                        requests.post(
                            API + "/ingest",
                            json={"forum": forumID, "flow": flowName, "bridge": bridgeData},
                            timeout=5
                        )
                        print("[sync] Forwarded to ingest service (data/real.jsonl) [OK]")
                    except Exception as e:
                        print(f"[sync] Ingest service not reachable: {e}")

                elif 'UpdatedTemplateJson' in data:
                    templateForAdmin = data['UpdatedTemplateJson']
                    forumIDCheck = templateForAdmin.get('ForumID')
                    if forumIDCheck == forumID:
                        with open(adminFile, 'w', encoding='utf-8') as f:
                            json.dump(templateForAdmin, f, indent=2)
                        print("[sync] UpdatedTemplateJson saved [OK]")
    except Exception as e:
        print(f"[sync] error: {e}")


# ── Send Bridge Helpers ───────────────────────────────────────────────────────

def sendBridgeToSet(flowName, replyData, fid, setName="Panel"):
    try:
        payload = {
            "ForumID":          forumID,
            "SessionID":        Sessionid,
            "MACAddress":       'Bridge-Web',
            "Time":             str(int(time.time() * 1000)),
            "ScheduledDateTime": "now",
            "ScheduledBoolean": 0,
            "FlowID":           flowName,
            "EnableChat":       1,
            "FlowType":         "Custom",
            "BridgeForward":    0,
            "TemplateID":       templateID,
            "TextCount":        len(replyData),
            "ImageCount":       0,
            "InvoiceID":        "",
            "DocumentCount":    0,
            "User":             False,
            "VideoCount":       0,
            "ReplyBridgeID":    "",
            "HiddenFlow":       False,
            "TempBridgeId":     str(uuid.uuid4()),
            flowName:           replyData,
            "FID":              fid,
            "ServerID":         serverID,
            "SentTo":           setName,
        }
        r = requests.post(
            'https://ca.cosmitude.com/bridgeSendingToForum',
            files={},
            data={"Data": json.dumps(payload)},
            timeout=600
        )
        print(f"[sendBridgeToSet] {flowName} to set '{setName}' -> HTTP {r.status_code}")
        return r
    except Exception as e:
        print(f"[sendBridgeToSet] error: {e}")
        return e


if __name__ == "__main__":
    go()

# End of bot code
