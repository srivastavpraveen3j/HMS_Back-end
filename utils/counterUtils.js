import Counter from "../models/counter.js";



export const getNextCounterValue = async (module, year, month, session) => {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const counterQuery = { module, year, month };
      
      // Try to find and update in one operation
      let counterDoc = await Counter.findOneAndUpdate(
        counterQuery,
        { $inc: { value: 1 } },
        { 
          new: true, 
          upsert: true,
          session,
          // ✅ This prevents the conflict by only setting defaults on insert
          setDefaultsOnInsert: true
        }
      );
      
      return counterDoc.value;
      
    } catch (error) {
      retryCount++;
      console.log(`Counter update attempt ${retryCount} failed:`, error.message);
      
      if (retryCount >= maxRetries) {
        throw new Error(`Failed to get counter after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait a bit before retry
      await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
    }
  }
};