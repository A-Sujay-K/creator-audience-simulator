#Start of bot code

#HookLab_Real
#HookLab

import time
import json
import requests
import base64
from datetime import datetime
import calendar
import uuid
from threading import Thread
import queue as Queue
import sys
from sys import platform
import os

Sessionid = ''
username = ''
MobileNumber = ''
forumID = '6cb2364b-d36a-4598-aa44-37218fd4688b'

# ── Local API endpoints ────────────────────────────────────────────────────
API = "http://localhost:8000"

def go():
    try:
        login()
        
        while True:
            clienntSync()
            time.sleep(10)
    except Exception as e:
        print (e)
        return e

#------------------------------------------
#Login
#------------------------------------------

def login():
    try:
        global Sessionid
        global username
        global MobileNumber
        global forumID
        tempJson = {
        "MACAddress": 'Bridge-Web',
        "UserName":'@uuidbfe6cd30b6394766b18026c407a7be6e',
        "Password":base64.b64decode('Q29zbWl0dWRlQnJpZGdlRGV2aWNl').decode('UTF-8'),
        "ServerID":'c9b6722d-5dbf-4b4f-a28e-692b4d26c1cf-7870eb8e-2f45-458a-9a70-d6b2d71ee871'
        }
        headers = {'Content-Type': 'application/json'}
        variab =json.dumps(tempJson)
        response = requests.post('https://ca.cosmitude.com/' + 'loginForDevice', data=variab,headers=headers, timeout=600)
        strData = str(response.text)
        respJson = json.loads(strData)
        Sessionid = respJson['ErrorMessage']['SessionID']
        countryCode = MobileNumber = respJson['ErrorMessage']['CountryCode']
        MobileNumber = countryCode+respJson['ErrorMessage']['MobileNumber']
        getForumDetails()
    except Exception as e:
        print (e)
        return e

#------------------------------------------
#Forum Details
#------------------------------------------ 
def getForumDetails():
    try:
        tempJson = {
        "MACAddress": 'Bridge-Web',
        "ForumID":forumID,
        "SessionID":Sessionid,
        "ServerID":'c9b6722d-5dbf-4b4f-a28e-692b4d26c1cf-7870eb8e-2f45-458a-9a70-d6b2d71ee871'
        }
        headers = {'Content-Type': 'application/json'}
        variab =json.dumps(tempJson)
        response = requests.post('https://ca.cosmitude.com/' + 'getRequestedForumDetails', data=variab,headers=headers, timeout=600)
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
                    with open('HookLab_Real_HookLab_Admin.txt', 'w') as f:
                        json.dump(saveForumDetails, f)
    except Exception as e:
        print (e)
        return e

#------------------------------------------
#Client Sync
#------------------------------------------

def clienntSync():
    try:
        clientSyncJson = {
        "SessionID":Sessionid,
        "MACAddress":'Bridge-Web',
        "ServerID":'c9b6722d-5dbf-4b4f-a28e-692b4d26c1cf-7870eb8e-2f45-458a-9a70-d6b2d71ee871',
        "ServerName":'Bridge'
        }
        headers = {'Content-Type': 'application/json'}
        variab =json.dumps(clientSyncJson)
        response = requests.post('https://ca.cosmitude.com/' + 'syncUserData', data=variab,headers=headers, timeout=600)
        strData = str(response.text)
        dataRead = json.loads(strData)
        print(dataRead['ErrorMessage'])
        syncData = dataRead['ErrorMessage']['Admin']
        if syncData.count:
            for data in syncData:
                if 'Bridge' in data:
                    bridgeData = data['Bridge']
                    flowName = bridgeData ['FlowID']
                    mNumber = bridgeData ['MobileNumber']

                    #<YOUR CODE STARTS HERE>

                    # ── Step 1: Always log the raw data (needed for Test S2) ──
                    print(f"[sync] Incoming flow: {flowName}")
                    print(f"[sync] Bridge data: {json.dumps(bridgeData)[:2000]}")

                    # ── Step 2: Always forward every bridge to the ingest service ──
                    try:
                        requests.post(
                            API + "/ingest",
                            json={"forum": forumID, "flow": flowName, "bridge": bridgeData},
                            timeout=5
                        )
                        print("[sync] Forwarded to ingest service ✓")
                    except Exception as e:
                        print(f"[sync] Ingest service not reachable: {e}")

                    # ── Step 3: When YOU submit SendBrief → bot sends Brief to Panel ──
                    if flowName.endswith("SendBrief") and MobileNumber != mNumber:
                        try:
                            brief = requests.get(API + "/brief", timeout=5).text
                            print(f"[sync] Sending brief to Panel set...")
                            sendBridgeToSet(bridgeData, 'Brief', brief, 'Panel')
                            print("[sync] Brief sent to Panel ✓")
                        except Exception as e:
                            print(f"[sync] Failed to send brief: {e}")

                    # ── Step 4: When YOU submit SendReport → bot posts PredictionReport ──
                    elif flowName.endswith("SendReport") and MobileNumber != mNumber:
                        try:
                            summary = requests.get(API + "/summary", timeout=5).text
                            print(f"[sync] Sending prediction report...")
                            sendBridge(bridgeData, 'PredictionReport', summary)
                            print("[sync] PredictionReport sent ✓")
                        except Exception as e:
                            print(f"[sync] Failed to send report: {e}")

                    #<YOUR CODE ENDS HERE>

                elif 'UpdatedTemplateJson' in data:
                    templateForAdmin = data['UpdatedTemplateJson']
                    forumIDCheck = templateForAdmin['ForumID']
                    if forumIDCheck == forumID:
                        with open('HookLab_Real_HookLab_Admin.txt', 'w') as f:
                            json.dump(templateForAdmin, f)
    except Exception as e:
        print (e)



# ── Send bridge helpers ────────────────────────────────────────────────────

def sendBridge(bridgeData, replyFlow, replyText):
    try:
        TemplateID = bridgeData.get('TemplateID', '1cb23b30-2ecf-5bab-fb40-bde82a3335b9')
        ForumID    = bridgeData.get('ForumID', forumID)
        full_flow  = f"HookLab_{replyFlow}"
        field_key  = 'HookLab_PredictionReport_Main-46818f41-b2a0-3faf-84e8-ddcf313e928d_2'
        FID        = '46818f41-b2a0-3faf-84e8-ddcf313e928d'

        replyData = {
            field_key: base64.b64encode(replyText.encode('utf-8')).decode('utf-8')
        }

        payload = {
            "ForumID":          ForumID,
            "SessionID":        Sessionid,
            "MACAddress":       'Bridge-Web',
            "Time":             str(int(time.time() * 1000)),
            "ScheduledDateTime": "now",
            "ScheduledBoolean": 0,
            "FlowID":           full_flow,
            "EnableChat":       1,
            "FlowType":         "Custom",
            "BridgeForward":    0,
            "TemplateID":       TemplateID,
            "TextCount":        1,
            "ImageCount":       0,
            "InvoiceID":        "",
            "DocumentCount":    0,
            "User":             False,
            "VideoCount":       0,
            "ReplyBridgeID":    "",
            "HiddenFlow":       False,
            "TempBridgeId":     str(uuid.uuid4()),
            full_flow:          replyData,
            "FID":              FID,
            "ServerID":         'c9b6722d-5dbf-4b4f-a28e-692b4d26c1cf-7870eb8e-2f45-458a-9a70-d6b2d71ee871',
            "SentTo":           '0',
        }
        r = requests.post('https://ca.cosmitude.com/bridgeSendingToForum',
                          files={}, data={"Data": json.dumps(payload)},
                          timeout=600)
        print(f"[sendBridge] {replyFlow} -> HTTP {r.status_code}")
        return r
    except Exception as e:
        print(f"[sendBridge] error: {e}")
        return e

def sendBridgeToSet(bridgeData, replyFlow, replyText, setName):
    try:
        TemplateID = bridgeData.get('TemplateID', '1cb23b30-2ecf-5bab-fb40-bde82a3335b9')
        ForumID    = bridgeData.get('ForumID', forumID)
        full_flow  = f"HookLab_{replyFlow}"
        field_key  = 'HookLab_Brief_Main-8e8cd5ed-bab7-0f52-8b26-794d0dcb88ad_2'
        FID        = '8e8cd5ed-bab7-0f52-8b26-794d0dcb88ad'

        replyData = {
            field_key: base64.b64encode(replyText.encode('utf-8')).decode('utf-8')
        }

        payload = {
            "ForumID":          ForumID,
            "SessionID":        Sessionid,
            "MACAddress":       'Bridge-Web',
            "Time":             str(int(time.time() * 1000)),
            "ScheduledDateTime": "now",
            "ScheduledBoolean": 0,
            "FlowID":           full_flow,
            "EnableChat":       1,
            "FlowType":         "Custom",
            "BridgeForward":    0,
            "TemplateID":       TemplateID,
            "TextCount":        1,
            "ImageCount":       0,
            "InvoiceID":        "",
            "DocumentCount":    0,
            "User":             False,
            "VideoCount":       0,
            "ReplyBridgeID":    "",
            "HiddenFlow":       False,
            "TempBridgeId":     str(uuid.uuid4()),
            full_flow:          replyData,
            "FID":              FID,
            "ServerID":         'c9b6722d-5dbf-4b4f-a28e-692b4d26c1cf-7870eb8e-2f45-458a-9a70-d6b2d71ee871',
            "SentTo":           setName,
        }
        r = requests.post('https://ca.cosmitude.com/bridgeSendingToForum',
                          files={}, data={"Data": json.dumps(payload)},
                          timeout=600)
        print(f"[sendBridgeToSet] {replyFlow} to set {setName} -> HTTP {r.status_code}")
        return r
    except Exception as e:
        print(f"[sendBridgeToSet] error: {e}")
        return e

go()

#End of bot code
