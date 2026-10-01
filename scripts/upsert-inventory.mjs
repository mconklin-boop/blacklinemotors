import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
const schema = z.object({
  id: z.string().regex(/^BLM-\d{4,}$/), stockNumber: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/), transactionType: z.literal("For Sale"),
  year: z.number().int().min(1900), make: z.string().min(1), model: z.string().min(1), trim: z.string(),
  vin: z.string().regex(/^[A-HJ-NPR-Z0-9]{17}$/), mileage: z.number().int().nonnegative(),
  exteriorColor: z.string(), interiorColor: z.string(), engine: z.string(), transmission: z.string(),
  drivetrain: z.string(), fuelType: z.string(), price: z.number().positive().optional(),
  titleType: z.string(), titleState: z.string(), category: z.string(), location: z.string(),
  availabilityStatus: z.enum(["Coming Soon", "Available", "Pending", "Sold", "Unavailable"]),
  condition: z.string(), description: z.string(), knownDamage: z.string(), repairsCompleted: z.string(),
  knownMechanicalIssues: z.string(), featured: z.boolean(), photos: z.array(z.string().startsWith("/inventory/")).min(1),
  photoNotes: z.string(), createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).strict();
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
if (!process.argv[2]) throw new Error("Usage: node scripts/upsert-inventory.mjs /path/to/public-vehicle.json");
const record=schema.parse(JSON.parse(await fs.readFile(process.argv[2],"utf8")));
if(record.id!==record.stockNumber) throw new Error("Stock number must match ID");
if(record.availabilityStatus==="Available" && (!record.price || /pending/i.test(record.titleType))) throw new Error("Available inventory requires a price and verified title details");
const file=path.join(root,"data/inventory.json");
const records=JSON.parse(await fs.readFile(file,"utf8"));
const sameVin=records.find(r=>r.vin===record.vin);
if(sameVin && sameVin.id!==record.id) throw new Error("This VIN already has a different stock number");
const sameStock=records.find(r=>r.id===record.id);
if(sameStock && sameStock.vin!==record.vin) throw new Error("Stock number already belongs to another VIN");
for(const p of record.photos) await fs.access(path.join(root,"public",p));
if(records.some(r=>r.slug===record.slug&&r.id!==record.id)) throw new Error("Duplicate listing URL");
await fs.writeFile(file,JSON.stringify([...records.filter(r=>r.id!==record.id),record],null,2)+"\n");
console.log(`Prepared ${record.stockNumber}. Run checks and deploy to publish. Private costs are rejected by the public schema.`);
