# Firestore Lens Data Migration Guide

This guide explains how to migrate your lens data and upgrades from JSON files to Google Firestore and manage them dynamically.

## 🚀 Quick Start

### 1. Initial Setup (One-time)

The app will automatically migrate your existing JSON data to Firestore on first load. However, you can also do it manually:

#### Option A: Automatic Migration
- Just run your app normally
- The system will detect if Firestore is empty and automatically migrate data from your JSON files

#### Option B: Manual Migration
1. Open your app in the browser
2. Open browser console (F12)
3. Run: `checkFirestoreDataStatus()` to check current status
4. Run: `initializeFirestoreData()` to migrate data

### 2. Managing Data

#### Admin Interface
- Navigate to `/admin/lens-manager` in your app
- Add new lens brands and upgrade options
- Delete existing data
- View all current data

#### Programmatic Management
```javascript
import { lensDataService } from './services/lensDataService';

// Add new lens data
await lensDataService.addLensData('NewBrand', {
  "Single Vision": {
    "BasicLens": {
      "NoCoating": {
        "1.5": "1.5 NewBrand BasicLens - No Coating"
      }
    }
  }
});

// Add new upgrades
await lensDataService.addUpgradesData('NewBrand', {
  "AntiReflective": {
    "Standard": "with Standard Anti-Reflective Coating"
  }
});
```

## 📁 Firestore Structure

### Collections Created:
- `lens_data` - Contains lens specifications by brand
- `upgrades_data` - Contains upgrade options by brand

### Document Structure:
```javascript
// Document ID: Brand name (e.g., "Zeiss", "Essilor")
{
  structure: {
    // Your lens/upgrade data structure
  },
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Features

### Caching
- Data is cached for 5 minutes to improve performance
- Cache is automatically cleared when data is modified

### Fallback Support
- If Firestore is unavailable, the app falls back to JSON files
- Ensures your app continues working even with network issues

### Real-time Updates
- Changes made through the admin interface are immediately available
- No need to restart the app or refresh the page

## 📊 Data Format

### Lens Data Format:
```json
{
  "LensType": {
    "LensName": {
      "Coating": {
        "Index": "Full Description String"
      }
    }
  }
}
```

### Upgrades Data Format:
```json
{
  "UpgradeCategory": {
    "OptionName": "Description String"
  }
}
```

## 🛠️ API Reference

### LensDataService Methods:

```javascript
// Fetch data
await lensDataService.getLensData()
await lensDataService.getUpgradesData()

// Add data
await lensDataService.addLensData(brandName, structure)
await lensDataService.addUpgradesData(brandName, structure)

// Update data
await lensDataService.updateLensData(brandName, structure)
await lensDataService.updateUpgradesData(brandName, structure)

// Delete data
await lensDataService.deleteLensData(brandName)
await lensDataService.deleteUpgradesData(brandName)

// Clear cache
lensDataService.clearCache()
```

## 🔒 Security Rules

Add these Firestore security rules to protect your data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read lens and upgrades data
    match /lens_data/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.email_verified;
    }
    
    match /upgrades_data/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.email_verified;
    }
  }
}
```

## 🚨 Troubleshooting

### Data Not Loading
1. Check browser console for errors
2. Verify Firestore security rules
3. Ensure user is authenticated
4. Try clearing cache: `lensDataService.clearCache()`

### Migration Issues
1. Check that JSON files exist in `/src/data/`
2. Verify JSON format is valid
3. Check Firestore permissions
4. Try manual migration from console

### Admin Interface Not Working
1. Ensure you're authenticated
2. Check the route `/admin/lens-manager`
3. Verify Firestore write permissions

## 📝 Adding New Data

### Through Admin Interface:
1. Go to `/admin/lens-manager`
2. Select "Lens Data" or "Upgrades Data" tab
3. Enter brand name
4. Paste JSON structure
5. Click "Add"

### Example New Lens Data:
```json
{
  "Progressive": {
    "Premium": {
      "MultiCoat": {
        "1.67": "1.67 YourBrand Premium - MultiCoat - Progressive Lenses"
      }
    }
  }
}
```

### Example New Upgrades Data:
```json
{
  "BlueLight": {
    "Standard": "with Blue Light Protection",
    "Premium": "with Premium Blue Light Protection"
  }
}
```

## 🔄 Migration Status

The app automatically handles migration and provides feedback:
- ✅ Data loaded from Firestore
- 🔄 Migrating from JSON files
- ⚠️ Using fallback data
- ❌ Error loading data

Check the browser console for detailed migration logs.