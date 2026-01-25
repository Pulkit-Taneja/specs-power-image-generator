// Firestore Data Initialization Script
// Run this in your browser console on your app to initialize Firestore with existing JSON data

import { migrateDataToFirestore, checkFirestoreData } from './utils/migration';

// Function to initialize Firestore data
window.initializeFirestoreData = async () => {
  try {
    console.log('🚀 Starting Firestore initialization...');
    
    // Check current data status
    const dataStatus = await checkFirestoreData();
    console.log('📊 Current data status:', dataStatus);
    
    if (dataStatus.hasLensData && dataStatus.hasUpgradesData) {
      const proceed = confirm(
        `Data already exists in Firestore:\n` +
        `- Lens data: ${dataStatus.lensDataCount} brands\n` +
        `- Upgrades data: ${dataStatus.upgradesDataCount} brands\n\n` +
        `Do you want to proceed anyway? This will add duplicate data.`
      );
      
      if (!proceed) {
        console.log('❌ Initialization cancelled by user');
        return;
      }
    }
    
    // Perform migration
    await migrateDataToFirestore();
    
    // Verify migration
    const newDataStatus = await checkFirestoreData();
    console.log('✅ Migration completed! New data status:', newDataStatus);
    
    alert('✅ Firestore initialization completed successfully!');
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    alert('❌ Initialization failed: ' + error.message);
  }
};

// Function to check data status
window.checkFirestoreDataStatus = async () => {
  try {
    const dataStatus = await checkFirestoreData();
    console.log('📊 Firestore data status:', dataStatus);
    
    const message = 
      `Firestore Data Status:\n` +
      `- Lens data: ${dataStatus.hasLensData ? '✅' : '❌'} (${dataStatus.lensDataCount} brands)\n` +
      `- Upgrades data: ${dataStatus.hasUpgradesData ? '✅' : '❌'} (${dataStatus.upgradesDataCount} brands)`;
    
    alert(message);
    return dataStatus;
  } catch (error) {
    console.error('❌ Error checking data status:', error);
    alert('❌ Error checking data status: ' + error.message);
  }
};

console.log(`
🔧 Firestore Initialization Tools Loaded!

Available functions:
- initializeFirestoreData() - Migrate JSON data to Firestore
- checkFirestoreDataStatus() - Check current Firestore data status

Usage:
1. Run checkFirestoreDataStatus() to see current status
2. Run initializeFirestoreData() to migrate data from JSON files
`);