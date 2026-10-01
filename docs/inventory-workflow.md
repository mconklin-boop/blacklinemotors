# Blackline Motors inventory workflow

Send the vehicle sheet, photos, asking price, availability, title documentation, location, known issues and completed repairs in this conversation. Each intake receives a stable BLM stock number and uses the VIN to prevent duplicate records.

The private Google Sheets tracker holds Inventory, Costs and Marketing tabs. Add individual expenses in Costs with the stock number. Inventory calculates recorded costs and gross profit after a sale price is entered. Confirm missing purchase amounts rather than treating them as zero.

The website reads public records from data/inventory.json. Purchase costs, margins, customer details and private tracker URLs must never enter this file. The strict scripts/upsert-inventory.mjs importer accepts only public listing fields, checks duplicate VINs and stock numbers, and verifies photo files exist. An Available record requires a price and title details.

For each intake: extract and reconcile facts, choose photos, retain original condition and odometer images, prepare light/background edits, update the private tracker and public record by stock number, prepare Facebook and Marketplace drafts, run typecheck/lint/build, then deploy and verify the live listing. Tracker edits do not automatically publish website changes. Send price/status/repair changes here so both records and ads can be updated together.

Use Coming Soon while diagnosis, sale terms or readiness are pending. Auction SOLD means purchased at auction, not sold to a Blackline customer. Do not infer clean title, roadworthiness or completed repairs from auction photography. Never retouch damage, warning lights, odometer digits or upholstery wear. Label background edits and retain original photos.

Facebook and Marketplace output is draft copy. Posting is a separate action. A coming-soon vehicle without an asking price stays a Marketplace draft until price and sale condition are supplied.
# Homepage spotlight

The homepage rotates its main spotlight every 10 Denver calendar days, starting September 30, 2026. It cycles through published sale inventory in stable stock-ID order, including Available and clearly labeled Coming Soon vehicles with photographs. Sold, Pending and Unavailable vehicles are excluded. With one eligible vehicle it stays featured; with none the spotlight is omitted. Updating inventory may immediately change the selected vehicle. The homepage calculates the rotation on each visit, so no manual republishing is required for a scheduled rotation. Other inventory remains browsable below the spotlight.
