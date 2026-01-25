import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Service for managing lens data and upgrades in Firestore
class LensDataService {
  constructor() {
    this.lensDataCache = null;
    this.upgradesDataCache = null;
    this.cacheTimestamp = null;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  // Check if cache is valid
  isCacheValid() {
    return this.cacheTimestamp && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION;
  }

  // Fetch lens data from Firestore
  async getLensData() {
    if (this.lensDataCache && this.isCacheValid()) {
      return this.lensDataCache;
    }

    try {
      const querySnapshot = await getDocs(collection(db, 'lens_data'));
      const lensData = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lensData[doc.id] = data.structure;
      });

      this.lensDataCache = lensData;
      this.cacheTimestamp = Date.now();
      return lensData;
    } catch (error) {
      console.error('Error fetching lens data:', error);
      // Return fallback data if Firestore fails
      return this.getFallbackLensData();
    }
  }

  // Fetch upgrades data from Firestore
  async getUpgradesData() {
    if (this.upgradesDataCache && this.isCacheValid()) {
      return this.upgradesDataCache;
    }

    try {
      const querySnapshot = await getDocs(collection(db, 'upgrades_data'));
      const upgradesData = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        upgradesData[doc.id] = data.structure;
      });

      this.upgradesDataCache = upgradesData;
      this.cacheTimestamp = Date.now();
      return upgradesData;
    } catch (error) {
      console.error('Error fetching upgrades data:', error);
      // Return fallback data if Firestore fails
      return this.getFallbackUpgradesData();
    }
  }

  // Add new lens data to Firestore
  async addLensData(brandName, lensStructure) {
    try {
      await setDoc(doc(db, 'lens_data', brandName), {
        structure: lensStructure,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Clear cache to force refresh
      this.clearCache();
      return true;
    } catch (error) {
      console.error('Error adding lens data:', error);
      throw error;
    }
  }

  // Add new upgrades data to Firestore
  async addUpgradesData(brandName, upgradesStructure) {
    try {
      await setDoc(doc(db, 'upgrades_data', brandName), {
        structure: upgradesStructure,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Clear cache to force refresh
      this.clearCache();
      return true;
    } catch (error) {
      console.error('Error adding upgrades data:', error);
      throw error;
    }
  }

  // Update existing lens data
  async updateLensData(brandName, lensStructure) {
    try {
      await setDoc(doc(db, 'lens_data', brandName), {
        structure: lensStructure,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      this.clearCache();
      return true;
    } catch (error) {
      console.error('Error updating lens data:', error);
      throw error;
    }
  }

  // Update existing upgrades data
  async updateUpgradesData(brandName, upgradesStructure) {
    try {
      await setDoc(doc(db, 'upgrades_data', brandName), {
        structure: upgradesStructure,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      this.clearCache();
      return true;
    } catch (error) {
      console.error('Error updating upgrades data:', error);
      throw error;
    }
  }

  // Delete lens data
  async deleteLensData(brandName) {
    try {
      await deleteDoc(doc(db, 'lens_data', brandName));
      this.clearCache();
      return true;
    } catch (error) {
      console.error('Error deleting lens data:', error);
      throw error;
    }
  }

  // Delete upgrades data
  async deleteUpgradesData(brandName) {
    try {
      await deleteDoc(doc(db, 'upgrades_data', brandName));
      this.clearCache();
      return true;
    } catch (error) {
      console.error('Error deleting upgrades data:', error);
      throw error;
    }
  }

  // Clear cache
  clearCache() {
    this.lensDataCache = null;
    this.upgradesDataCache = null;
    this.cacheTimestamp = null;
  }

  // Fallback data (from your current JSON files)
  getFallbackLensData() {
    // Import your current lensData.json content as fallback
    return require('../data/lensData.json');
  }

  getFallbackUpgradesData() {
    // Import your current upgrades.json content as fallback
    return require('../data/upgrades.json');
  }

  // Initialize Firestore with existing JSON data (run once)
  async initializeFirestoreData() {
    try {
      const lensData = this.getFallbackLensData();
      const upgradesData = this.getFallbackUpgradesData();

      // Add lens data to Firestore
      for (const [brandName, brandData] of Object.entries(lensData)) {
        await this.addLensData(brandName, brandData);
      }

      // Add upgrades data to Firestore
      for (const [brandName, brandData] of Object.entries(upgradesData)) {
        await this.addUpgradesData(brandName, brandData);
      }

      console.log('Firestore initialized with existing data');
      return true;
    } catch (error) {
      console.error('Error initializing Firestore data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const lensDataService = new LensDataService();
export default lensDataService;