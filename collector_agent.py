# collector_agent.py
# Run with:  .venv\Scripts\python collector_agent.py
#
# This is the ParallelCollector bot for the _Real forums.
# Generated from Bridge then edited in the #<YOUR CODE STARTS HERE> block.
#
# Before running:
#   1. In Bridge -> Agent Management -> Show Details -> Reset password
#      Copy the password and replace <YOUR_BOT_PASSWORD> below.
#   2. Make sure uvicorn is running: uvicorn parallel.ingest:app --port 8000

import time
import json
import requests
import base64
from threading import Thread
import queue as Queue
import uuid
import os

Sessionid = ''
username   = ''
MobileNumber = ''

# ── Forum IDs ──────────────────────────────────────────────────────────────
# Replace these with your actual _Real forum IDs after completing Part 6.2.
forumID = 'dfc19f73-00e0-47c2-8a8e-7014f5a149e5'   # toy forum from Part 4; update for Parallel

# ── Bot credentials ────────────────────────────────────────────────────────
BOT_USERNAME = '@uuid7ecbf49db0c543e0b7d0f3507eff806f'
BOT_PASSWORD = base64.b64decode('Q29zbWl0dWRlQnJpZGdlRGV2aWNl').decode('UTF-8')

SERVER_ID = 'c9b6722d-5dbf-4b4f-a28e-692b4d26c1cf-7870eb8e-2f45-458a-9a70-d6b2d71ee871'
BASE_URL  = 'https://ca.cosmitude.com/'
MAC       = 'Bridge-Web'

INGEST_URL = 'http://localhost:8000/ingest'
SUMMARY_URL = 'http://localhost:8000/summary'

# ── Entry point ────────────────────────────────────────────────────────────

def go():
    try:
        login()
        while True:
            clientSync()
            time.sleep(10)
    except Exception as e:
        print(e)
        return e

# ── Login ──────────────────────────────────────────────────────────────────

def login():
    global Sessionid, username, MobileNumber
    payload = {
        "MACAddress": MAC,
        "UserName":   BOT_USERNAME,
        "Password":   BOT_PASSWORD,
        "ServerID":   SERVER_ID,
    }
    r = requests.post(BASE_URL + 'loginForDevice',
                      data=json.dumps(payload),
                      headers={'Content-Type': 'application/json'},
                      timeout=600)
    resp = r.json()
    Sessionid   = resp['ErrorMessage']['SessionID']
    countryCode = resp['ErrorMessage']['CountryCode']
    MobileNumber = countryCode + resp['ErrorMessage']['MobileNumber']
    print(f"[login] OK — session={Sessionid[:8]}…  mobile={MobileNumber}")
    getForumDetails()

# ── Forum details ──────────────────────────────────────────────────────────

def getForumDetails():
    payload = {
        "MACAddress": MAC,
        "ForumID":    forumID,
        "SessionID":  Sessionid,
        "ServerID":   SERVER_ID,
    }
    r = requests.post(BASE_URL + 'getRequestedForumDetails',
                      data=json.dumps(payload),
                      headers={'Content-Type': 'application/json'},
                      timeout=600)
    if r.status_code == 200:
        resp = r.json()
        if resp.get('ErrorCode') == 1172:
            for item in resp['ErrorMessage']['ForumDataArray']:
                details = item[forumID]['NewForumJsonData']
                with open('ParallelDecision_ParallelDecision_Admin.txt', 'w') as f:
                    json.dump(details, f)
            print("[forum] Template JSON saved.")

# ── Client sync ────────────────────────────────────────────────────────────

def clientSync():
    payload = {
        "SessionID":  Sessionid,
        "MACAddress": MAC,
        "ServerID":   SERVER_ID,
        "ServerName": 'Bridge',
    }
    r = requests.post(BASE_URL + 'syncUserData',
                      data=json.dumps(payload),
                      headers={'Content-Type': 'application/json'},
                      timeout=600)
    dataRead = r.json()
    syncData = dataRead['ErrorMessage']['Admin']

    for data in syncData:
        if 'Bridge' in data:
            bridgeData = data['Bridge']
            flowName   = bridgeData['FlowID']
            mNumber    = bridgeData['MobileNumber']

            # ──────────────────────────────────────────────────────────────
            #<YOUR CODE STARTS HERE>

            # Always log incoming data so you can complete Test S2.
            print(f"[sync] flow={flowName}")
            print("[sync] bridgeData =", json.dumps(bridgeData)[:2000])

            # Forward every incoming bridge to the ingest service.
            try:
                requests.post(INGEST_URL,
                              json={"forum": forumID,
                                    "flow":  flowName,
                                    "bridge": bridgeData},
                              timeout=5)
                print("[sync] -> forwarded to ingest")
            except Exception as e:
                print(f"[sync] ingest failed: {e}")

            # When an admin submits RunRequest, post the latest summary
            # back as a PredictionReport (will sit as Pending until you approve).
            if flowName == "ParallelDecision_RunRequest" and MobileNumber != mNumber:
                try:
                    summary_text = requests.get(SUMMARY_URL, timeout=5).text
                except Exception:
                    summary_text = "No summary available yet."

                reply_data = {
                    # Field key read from the saved template JSON at runtime by sendBridge()
                    # (sendBridge reads the FID from the template file — no hardcoding needed)
                }
                # Build the encoded field dict using the key from the template file.
                # sendBridge will inject the FID; we just need the flow's data field.
                # The key pattern is:  {TemplateName}_{FlowName}_{FormatName}-{UUID}_{index}
                # Look it up in ParallelDecision_ParallelDecision_Admin.txt after first sync.
                # For now use the placeholder from the generated code:
                SUMMARY_FIELD_KEY = 'ParallelDecision_PredictionReport_Main-fde4a45b-b93c-666e-c702-ac32c6a09830_2'
                send_data = {
                    SUMMARY_FIELD_KEY: base64.b64encode(
                        summary_text.encode('utf-8')).decode('utf-8')
                }
                que = Queue.Queue()
                t = Thread(target=lambda q, a, b, c: q.put(sendBridge(a, b, c)),
                           args=(que, bridgeData, 'ParallelDecision_PredictionReport', send_data))
                t.start()
                t.join()
                print("[sync] PredictionReport sent (pending approval)")

            #<YOUR CODE ENDS HERE>
            # ──────────────────────────────────────────────────────────────

        elif 'UpdatedTemplateJson' in data:
            tmpl = data['UpdatedTemplateJson']
            if tmpl.get('ForumID') == forumID:
                with open('ParallelDecision_ParallelDecision_Admin.txt', 'w') as f:
                    json.dump(tmpl, f)
                print("[sync] Template JSON updated.")

# ── Send bridge ────────────────────────────────────────────────────────────

def sendBridge(bridgeData, replyFlow, replyData):
    try:
        TemplateID = bridgeData['TemplateID']
        ForumID    = bridgeData['ForumID']
        # Read the FID for the reply flow from the saved template JSON
        with open('ParallelDecision_ParallelDecision_Admin.txt', 'r') as f:
            jsonData = json.load(f)
        FID = jsonData['AdminFlow'][replyFlow]['FID']

        payload = {
            "ForumID":          ForumID,
            "SessionID":        Sessionid,
            "MACAddress":       MAC,
            "Time":             "6516516156161",
            "ScheduledDateTime": "now",
            "ScheduledBoolean": 0,
            "FlowID":           replyFlow,
            "EnableChat":       1,
            "FlowType":         "Custom",
            "BridgeForward":    0,
            "TemplateID":       TemplateID,
            "TextCount":        1,
            "ImageCount":       1,
            "InvoiceID":        "",
            "DocumentCount":    0,
            "User":             False,
            "VideoCount":       0,
            "ReplyBridgeID":    "",
            "HiddenFlow":       False,
            "TempBridgeId":     str(uuid.uuid4()),
            replyFlow:          replyData,
            "FID":              FID,
            "ServerID":         SERVER_ID,
            "SentTo":           '0',
        }
        r = requests.post(BASE_URL + 'bridgeSendingToForum',
                          files={}, data={"Data": json.dumps(payload)},
                          timeout=600)
        print(f"[sendBridge] {replyFlow} -> HTTP {r.status_code}")
        return r
    except Exception as e:
        print(f"[sendBridge] error: {e}")
        return e


go()
