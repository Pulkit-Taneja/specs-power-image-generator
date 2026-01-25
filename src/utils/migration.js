import { lensDataService } from '../services/lensDataService';
import lensData from '../data/lensData.json';
import upgradesData from '../data/upgrades.json';

// One-time migration script to upload existing JSON data to Firestore
export const migrateDataToFirestore = async () => {
  try {
    console.log('Starting migration to Firestore...');
    
    // Migrate lens data
    console.log('Migrating lens data...');
    for (const [brandName, brandData] of Object.entries(lensData)) {
      await lensDataService.addLensData(brandName, brandData);
      console.log(`✓ Migrated lens data for brand: ${brandName}`);
    }
    
    // Migrate upgrades data
    console.log('Migrating upgrades data...');
    for (const [brandName, brandData] of Object.entries(upgradesData)) {
      await lensDataService.addUpgradesData(brandName, brandData);
      console.log(`✓ Migrated upgrades data for brand: ${brandName}`);
    }
    
    console.log('✅ Migration completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Function to check if data exists in Firestore
export const checkFirestoreData = async () => {
  try {
    const lensData = await lensDataService.getLensData();
    const upgradesData = await lensDataService.getUpgradesData();
    
    const hasLensData = Object.keys(lensData).length > 0;
    const hasUpgradesData = Object.keys(upgradesData).length > 0;
    
    return {
      hasLensData,
      hasUpgradesData,
      lensDataCount: Object.keys(lensData).length,
      upgradesDataCount: Object.keys(upgradesData).length
    };
  } catch (error) {
    console.error('Error checking Firestore data:', error);
    return {
      hasLensData: false,
      hasUpgradesData: false,
      lensDataCount: 0,
      upgradesDataCount: 0
    };
  }
};