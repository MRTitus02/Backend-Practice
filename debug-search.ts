import { itemsService } from "./src/services/items.service";

async function testSearch() {
  try {
    console.log("Testing search with query 'laptop'...");
    const results = await itemsService.search("laptop", 10, 0);
    console.log("Results:", results);
    console.log("Number of results:", results.length);
    if (results.length > 0) {
      console.log("First result:", results[0]);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testSearch();
