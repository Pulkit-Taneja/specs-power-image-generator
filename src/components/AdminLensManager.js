import React, { useState, useEffect } from 'react';
import { lensDataService } from '../services/lensDataService';
import { checkFirestoreData } from '../utils/migration';

const AdminLensManager = () => {
  const [lensData, setLensData] = useState({});
  const [upgradesData, setUpgradesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('lens');
  const [newBrandName, setNewBrandName] = useState('');
  const [newDataJson, setNewDataJson] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      color: '#333'
    },
    tabs: {
      display: 'flex',
      marginBottom: '20px',
      borderBottom: '2px solid #eee'
    },
    tab: {
      padding: '10px 20px',
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      fontSize: '16px',
      fontWeight: '500'
    },
    activeTab: {
      borderBottom: '2px solid #007bff',
      color: '#007bff'
    },
    section: {
      marginBottom: '30px',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    },
    input: {
      width: '100%',
      padding: '10px',
      margin: '10px 0',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    textarea: {
      width: '100%',
      minHeight: '200px',
      padding: '10px',
      margin: '10px 0',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      fontFamily: 'monospace'
    },
    button: {
      padding: '10px 20px',
      margin: '5px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    primaryButton: {
      backgroundColor: '#007bff',
      color: 'white'
    },
    dangerButton: {
      backgroundColor: '#dc3545',
      color: 'white'
    },
    successButton: {
      backgroundColor: '#28a745',
      color: 'white'
    },
    dataList: {
      maxHeight: '400px',
      overflowY: 'auto',
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '10px'
    },
    dataItem: {
      padding: '10px',
      margin: '5px 0',
      backgroundColor: 'white',
      border: '1px solid #eee',
      borderRadius: '4px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    message: {
      padding: '10px',
      margin: '10px 0',
      borderRadius: '4px',
      textAlign: 'center'
    },
    successMessage: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    errorMessage: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lensDataFromFirestore, upgradesDataFromFirestore] = await Promise.all([
        lensDataService.getLensData(),
        lensDataService.getUpgradesData()
      ]);
      
      setLensData(lensDataFromFirestore);
      setUpgradesData(upgradesDataFromFirestore);
    } catch (error) {
      showMessage('Error loading data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleAddData = async () => {
    if (!newBrandName.trim()) {
      showMessage('Please enter a brand name', 'error');
      return;
    }

    if (!newDataJson.trim()) {
      showMessage('Please enter JSON data', 'error');
      return;
    }

    try {
      const parsedData = JSON.parse(newDataJson);
      
      if (selectedTab === 'lens') {
        await lensDataService.addLensData(newBrandName, parsedData);
        showMessage(`Lens data for ${newBrandName} added successfully!`, 'success');
      } else {
        await lensDataService.addUpgradesData(newBrandName, parsedData);
        showMessage(`Upgrades data for ${newBrandName} added successfully!`, 'success');
      }
      
      setNewBrandName('');
      setNewDataJson('');
      await loadData();
    } catch (error) {
      if (error instanceof SyntaxError) {
        showMessage('Invalid JSON format. Please check your JSON syntax.', 'error');
      } else {
        showMessage('Error adding data: ' + error.message, 'error');
      }
    }
  };

  const handleDeleteData = async (brandName) => {
    if (!window.confirm(`Are you sure you want to delete ${brandName}?`)) {
      return;
    }

    try {
      if (selectedTab === 'lens') {
        await lensDataService.deleteLensData(brandName);
        showMessage(`Lens data for ${brandName} deleted successfully!`, 'success');
      } else {
        await lensDataService.deleteUpgradesData(brandName);
        showMessage(`Upgrades data for ${brandName} deleted successfully!`, 'success');
      }
      
      await loadData();
    } catch (error) {
      showMessage('Error deleting data: ' + error.message, 'error');
    }
  };

  const getCurrentData = () => {
    return selectedTab === 'lens' ? lensData : upgradesData;
  };

  const getExampleJson = () => {
    if (selectedTab === 'lens') {
      return JSON.stringify({
        "Single Vision": {
          "ClearView": {
            "HardCoat UV": {
              "1.5": "1.5 Example ClearView - HardCoat UV - Single Vision Lenses",
              "1.59": "1.59 Example ClearView - HardCoat UV - Single Vision Lenses"
            }
          }
        }
      }, null, 2);
    } else {
      return JSON.stringify({
        "PhotoFusion X": {
          "Grey": "with PhotoFusion X Grey",
          "Brown": "with PhotoFusion X Brown"
        }
      }, null, 2);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Lens Data Manager</h1>
      
      {message && (
        <div style={{
          ...styles.message,
          ...(messageType === 'success' ? styles.successMessage : styles.errorMessage)
        }}>
          {message}
        </div>
      )}

      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(selectedTab === 'lens' ? styles.activeTab : {})
          }}
          onClick={() => setSelectedTab('lens')}
        >
          Lens Data
        </button>
        <button
          style={{
            ...styles.tab,
            ...(selectedTab === 'upgrades' ? styles.activeTab : {})
          }}
          onClick={() => setSelectedTab('upgrades')}
        >
          Upgrades Data
        </button>
      </div>

      <div style={styles.section}>
        <h3>Add New {selectedTab === 'lens' ? 'Lens' : 'Upgrades'} Data</h3>
        
        <input
          type="text"
          placeholder="Brand Name (e.g., Zeiss, Essilor)"
          value={newBrandName}
          onChange={(e) => setNewBrandName(e.target.value)}
          style={styles.input}
        />
        
        <textarea
          placeholder={`Enter JSON structure for ${selectedTab} data...\n\nExample:\n${getExampleJson()}`}
          value={newDataJson}
          onChange={(e) => setNewDataJson(e.target.value)}
          style={styles.textarea}
        />
        
        <button
          onClick={handleAddData}
          style={{ ...styles.button, ...styles.primaryButton }}
        >
          Add {selectedTab === 'lens' ? 'Lens' : 'Upgrades'} Data
        </button>
      </div>

      <div style={styles.section}>
        <h3>Existing {selectedTab === 'lens' ? 'Lens' : 'Upgrades'} Data</h3>
        
        <div style={styles.dataList}>
          {Object.keys(getCurrentData()).length === 0 ? (
            <p>No data found</p>
          ) : (
            Object.keys(getCurrentData()).map(brandName => (
              <div key={brandName} style={styles.dataItem}>
                <div>
                  <strong>{brandName}</strong>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {Object.keys(getCurrentData()[brandName]).length} categories
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteData(brandName)}
                  style={{ ...styles.button, ...styles.dangerButton }}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={styles.section}>
        <h3>Data Structure Guide</h3>
        <p><strong>Lens Data Structure:</strong></p>
        <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
{`{
  "LensType": {
    "LensName": {
      "Coating": {
        "Index": "Description"
      }
    }
  }
}`}
        </pre>
        
        <p><strong>Upgrades Data Structure:</strong></p>
        <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
{`{
  "UpgradeType": {
    "Option": "Description"
  }
}`}
        </pre>
      </div>
    </div>
  );
};

export default AdminLensManager;