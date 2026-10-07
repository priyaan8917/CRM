# Nikhand Campaign CRM — Angular + Node.js + SQLite

## Windows-ல் run செய்வது / How to run

1. Install **Node.js 24** (the SQLite database engine is included in Node.js; no separate database installation).
2. Extract the ZIP fully. Open the **crm_angular_node** folder containing **package.json**. Do not run npm in the parent folder.
3. Double-click **start_windows.bat**, or open a terminal in this folder and run:

```bat
npm.cmd ci
npm.cmd start
```

4. Open **http://127.0.0.1:3000**. Keep the terminal open.
5. First run: create your administrator username/password. Password: at least 10 characters. No default password is included.

`npm.cmd run serve` is also an alias for `npm.cmd start`.

## Team & campaign workflow / எப்படி use செய்வது

1. **Team & roles** → create 5 users with role **Agent**. Share their individual usernames/passwords yourself.
2. **Telecaller Extensions** → create an optional profile for each user ID with extension/mobile and availability. Extension provisioning remains with the SIP provider.
3. **Auto Dial Center** → add a Phone campaign (name, dates, status).
4. Select the campaign. Tick telecallers in the required order and click **Save Team**.
5. Import a CSV using the sample in `samples/leads.csv`. Required headers: `name,phone`. Optional: `email,location,notes`.
6. Leads are assigned round-robin: caller 1, 2, 3, 4, 5, then caller 1 again. **6வது lead → 1st telecaller; 7வது → 2nd telecaller.** Later uploads continue the same cycle. Same-campaign duplicate numbers are skipped without advancing the cursor.
7. A telecaller signs in and sees only their assigned leads. Open **Feedback** for a lead.
8. Choose **Interested / Not Interested / Call Back / No Answer / Busy / Do Not Call**. Add conversation notes and save. Call Back requires a future date/time and creates a follow-up.
9. Tick **Also save manual call record** and enter direction, outcome and talk seconds if a call actually occurred. Preparing a call does not count it as connected.
10. **Feedback Buttons** lets an admin add custom buttons such as Site Visit Requested. Feedback history keeps earlier notes.
11. **Reports & analytics** includes Activity Dashboard, Hourly Performance and Talktime reports with dates and CSV export. Reports use saved manual call logs.

## Calling / SIP / Airtel / DID numbers

- **DID Management**: add your approved numbers individually (30 or more rows supported). Set Active, Paused, or Flagged.
- **Global Settings → Calling Configuration**: enter your provider label and SIP host, if you use an installed SIP softphone.
- Lead Feedback → choose an active DID → **Open dialer** → **Launch call** opens a `sip:` or `tel:` URI in your installed dialer.
- **Important functional limit:** selecting a DID in this app does not set caller ID in the softphone. Your provider/PBX must provision that DID and route the extension. This version does not implement an Airtel API or an in-browser SIP media stack.
- Incoming and outgoing conversations can be recorded manually in the CRM. Automatic incoming routing, call status, recordings and number failover need provider integration.
- A Flagged DID is unavailable for dialing; review it with your provider. This app does not rotate numbers to bypass spam blocking.
- Do Not Call leads cannot use the dialing action.

## Separate IVR application

Open the sibling `ivr` folder and double-click `start_windows.bat`, then visit http://127.0.0.1:3001. Its README explains dry runs and the provider-adapter contract. **Dry Run-ல் actual call போகாது.** Live use needs credentials and a provider-specific adapter; they were not supplied.

## Reference images and scope

All 16 uploaded screenshots are included in `src/assets/references` and are accessible in **Screen References**. The blue/white layout, compact navigation, lead filters, campaign panels, master screens, DID configuration and report screens follow these references. Some screenshots show features beyond the supplied requirements (bulk deletion, voice quality monitoring, join/maybe-later notifications and live campaign controls); those are not implemented as fake actions.

## Database, development and deployment limits

- On first start, `database/crm.sqlite3` is created automatically. The delivered ZIP has no existing accounts or customer data.
- Stop the server before backing up the database. `CRM_DATABASE` can choose another file; `PORT` can change port 3000.
- Add new sources/modules in `server.cjs`; campaign extensions live in `campaign-api.cjs`.
- `npm.cmd run build`: compile Angular. `npm.cmd test`: run campaign/permission tests.
- Sessions last 8 hours and reset when the server restarts. CSRF protection and salted password hashes are included.
- This package binds to localhost for individual testing. Five simultaneous remote team members require a deployed server, TLS, network access and production authentication/session hardening. It is not publicly deployed.
- Changing campaign team membership restarts its assignment cursor; existing assignments remain unchanged. Assignment does not skip offline users automatically.
- Self-registration, email password recovery, browser calling and automatic reminders are not included.
