import { db } from "./src/db/client";
import { items, users } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function createSampleData() {
  console.log("Creating sample data...");

  // Create a test user
  const [user] = await db.insert(users).values({
    name: "Test User",
    email: `test${Date.now()}@example.com`,
    passwordHash: "hash",
  }).returning();

  console.log(`Created user with id: ${user.id}`);

  // Create sample items
  const sampleItems = [
    "Laptop Computer", "Wireless Mouse", "Coffee Mug", "Spiral Notebook",
    "Noise Cancelling Headphones", "Mechanical Keyboard", "USB Flash Drive",
    "External Hard Drive", "Webcam", "Microphone", "Smartphone Stand",
    "Desk Lamp", "Office Chair", "Whiteboard Markers", "Sticky Notes",
    "Printer Paper", "Ethernet Cable", "Power Strip", "Monitor Stand",
    "Computer Mouse Pad", "Keyboard Wrist Rest", "Cable Organizer",
    "Document Scanner", "Label Printer", "Projector Screen", "Conference Phone",
    "Video Conferencing Camera", "Bluetooth Speaker", "Wireless Charger",
    "Laptop Cooling Pad", "Graphics Tablet", "Digital Drawing Pen",
    "VR Headset", "Gaming Mouse", "RGB Keyboard", "Streaming Microphone",
    "Podcast Microphone", "Audio Interface", "Studio Monitors",
    "MIDI Keyboard", "Guitar Amplifier", "Bass Guitar", "Drum Machine",
    "Synthesizer", "Music Production Software", "DAW Controller",
    "Audio Recorder", "Field Recorder", "Condenser Microphone",
    "Dynamic Microphone", "USB Microphone", " Lavalier Microphone",
    "Shotgun Microphone", "Boundary Microphone", "Gooseneck Microphone",
    "Paging Microphone", "Wireless Microphone System", "Microphone Stand",
    "Pop Filter", "Microphone Cable", "XLR Cable", "Audio Cable",
    "Instrument Cable", "Speaker Cable", "Power Cable", "Extension Cord",
    "Surge Protector", "UPS Battery Backup", "Power Inverter",
    "Car Charger", "Wall Charger", "Portable Charger", "Power Bank",
    "Solar Charger", "Wireless Power Bank", "Charging Station",
    "Cable Management", "Wire Organizer", "Cable Clips", "Velcro Straps",
    "Cable Ties", "Cable Sleeves", "Cord Concealer", "Wall Plate",
    "Keystone Jack", "Patch Panel", "Network Switch", "Router",
    "Modem", "Wireless Access Point", "Network Cable", "Fiber Optic Cable",
    "Coaxial Cable", "Telephone Cable", "Serial Cable", "Parallel Cable",
    "SCSI Cable", "IDE Cable", "SATA Cable", "SAS Cable",
    "Thunderbolt Cable", "USB Cable", "HDMI Cable", "DisplayPort Cable",
    "VGA Cable", "DVI Cable", "Component Cable", "Composite Cable",
    "S-Video Cable", "RCA Cable", "Optical Cable", "Coaxial Digital Cable",
    "TOSLINK Cable", "MHL Cable", "SlimPort Cable", "Lightning Cable",
    "Micro USB Cable", "USB-C Cable", "MagSafe Cable", "Proprietary Cable"
  ];

  const itemsToInsert = sampleItems.map(title => ({
    title,
    description: `A high-quality ${title.toLowerCase()} for professional use`,
    userId: user.id,
  }));

  await db.insert(items).values(itemsToInsert);

  console.log(`Created ${sampleItems.length} sample items`);

  // Test search query
  console.log("Testing search performance...");

  const start = Date.now();
  const results = await db.execute(`
    SELECT id, title, description, similarity(title || ' ' || description, 'computer') as sim
    FROM items
    WHERE similarity(title || ' ' || description, 'computer') > 0.1
    ORDER BY sim DESC
    LIMIT 10
  `);
  const end = Date.now();

  console.log(`Search took ${end - start}ms`);
  console.log(`Found ${results.rows.length} results`);

  // Check EXPLAIN
  console.log("EXPLAIN output:");
  const explain = await db.execute(`
    EXPLAIN SELECT id, title, description, similarity(title || ' ' || description, 'computer') as sim
    FROM items
    WHERE similarity(title || ' ' || description, 'computer') > 0.1
    ORDER BY sim DESC
    LIMIT 10
  `);

  console.log(explain.rows.map(r => r['QUERY PLAN']).join('\n'));

  // Cleanup
  await db.delete(items).where(eq(items.userId, user.id));
  await db.delete(users).where(eq(users.id, user.id));

  console.log("Sample data cleaned up");
}

createSampleData().catch(console.error);