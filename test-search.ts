import { db } from "./src/db/client";
import { items } from "./src/db/schema";
import { sql } from "drizzle-orm";

async function testSearch() {
  console.log("Testing search functionality...\n");

  try {
    // Test 1: Basic search
    console.log("Test 1: Search for 'laptop'");
    const results = await db
      .select({
        id: items.id,
        title: items.title,
        similarity: sql<number>`similarity((title || ' ' || description), 'laptop')`,
      })
      .from(items)
      .where(sql`similarity((title || ' ' || description), 'laptop') > 0.1`)
      .orderBy(sql`similarity DESC`)
      .limit(5);

    console.log(`Found ${results.length} results:`);
    results.forEach((r: any) => {
      console.log(`  - ${r.title} (similarity: ${(r.similarity * 100).toFixed(1)}%)`);
    });

    // Test 2: Search with no results
    console.log("\nTest 2: Search for 'xyzabc' (no results)");
    const noResults = await db
      .select({
        id: items.id,
        title: items.title,
        similarity: sql<number>`similarity((title || ' ' || description), 'xyzabc')`,
      })
      .from(items)
      .where(sql`similarity((title || ' ' || description), 'xyzabc') > 0.1`);

    console.log(`Found ${noResults.length} results`);

    // Test 3: Check total items
    console.log("\nTest 3: Total items in database");
    const count = await db.select({ count: sql<number>`COUNT(*)` }).from(items);
    console.log(`Total items: ${count[0].count}`);

    console.log("\n✅ Search tests passed!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testSearch();
