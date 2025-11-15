import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import Switch from '@mui/material/Switch';
import { BRANCHES } from "../constants";

// Custom CSS styles as a JavaScript object
const baseStyles = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#f4f6f9',
    padding: '40px 0',
    margin: '0',
    width: '100%',
    position: 'relative',
  },
  
  container: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    position: 'relative',
    zIndex: 1,
  },
  
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  
  branchSelector: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '25px',
  },
  
  branchLabel: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#495057',
  },
  
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  
  section: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#495057',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  
  powerTable: {
    display: 'grid',
    gridTemplateColumns: '80px minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)',
    gap: '12px',
    alignItems: 'center',
  },
  
  eyeLabel: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
  },
  
  input: {
    padding: '12px',
    fontSize: '1rem',
    border: '2px solid #e9ecef',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    outline: 'none',
    minWidth: 0,
  },
  
  inputFocus: {
    borderColor: '#667eea',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
  },
  
  textarea: {
    padding: '12px',
    fontSize: '1rem',
    border: '2px solid #e9ecef',
    borderRadius: '6px',
    resize: 'vertical',
    minHeight: '100px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  
  additionRow: {
    display: 'grid',
    gridTemplateColumns: '120px minmax(0, 1fr) minmax(0, 1fr)',
    gap: '12px',
    alignItems: 'center',
    marginTop: '15px',
  },
  
  copyButton: {
    padding: '8px 16px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    alignSelf: 'center',
    marginTop: '10px',
  },
  
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  
  checkbox: {
    width: '20px',
    height: '20px',
    accentColor: '#667eea',
  },
  
  checkboxLabel: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#495057',
    cursor: 'pointer',
  },
  
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: '30px',
  },
  
  button: {
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '140px',
  },
  
  primaryButton: {
    backgroundColor: '#667eea',
    color: 'white',
  },
  
  secondaryButton: {
    backgroundColor: '#28a745',
    color: 'white',
  },
  
  dangerButton: {
    backgroundColor: '#dc3545',
    color: 'white',
  },
  
  imageSection: {
    marginTop: '30px',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '2px dashed #dee2e6',
  },
  
  generatedImage: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  
  loadingSpinner: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  
  errorText: {
    color: '#dc3545',
    fontSize: '0.9rem',
    marginTop: '5px',
  },
  
  successText: {
    color: '#28a745',
    fontSize: '0.9rem',
    marginTop: '5px',
  },
};

// Add keyframe animation for spinner and global resets
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  /* Reset body and html to ensure proper scrolling */
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    height: 100%;
    overflow-x: hidden;
  }
  
  #root {
    min-height: 100vh;
    position: relative;
  }
  
  /* Keyframe animations */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Hover effects */
  .hover-primary:hover {
    background-color: #5a6fd8 !important;
    transform: translateY(-2px);
  }
  
  .hover-secondary:hover {
    background-color: #218838 !important;
    transform: translateY(-2px);
  }
  
  .hover-danger:hover {
    background-color: #c82333 !important;
    transform: translateY(-2px);
  }
  
  .hover-info:hover {
    background-color: #138496 !important;
    transform: translateY(-2px);
  }
  
  /* Override problematic global styles */
  .specs-input-wrapper {
    position: relative;
    min-height: 100vh;
    width: 100%;
  }
  
  /* Ensure the header stays at top but doesn't interfere with layout */
  .right-content-container {
    position: relative;
    width: 100%;
    z-index: 1000;
  }
`;
document.head.appendChild(styleSheet);

const getViewportWidth = () => (typeof window !== 'undefined' ? window.innerWidth : 1024);

const useResponsiveStyles = () => {
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth);

  useEffect(() => {
    const handleResize = () => setViewportWidth(getViewportWidth());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return useMemo(() => {
    const isTablet = viewportWidth <= 900;
    const isMobile = viewportWidth <= 540;

    return {
      ...baseStyles,
      container: {
        ...baseStyles.container,
        maxWidth: isTablet ? '100%' : baseStyles.container.maxWidth,
        padding: isMobile ? '20px 16px' : isTablet ? '26px' : baseStyles.container.padding,
      },
      title: {
        ...baseStyles.title,
        fontSize: isMobile ? '1.8rem' : isTablet ? '2.2rem' : baseStyles.title.fontSize,
      },
      powerTable: {
        ...baseStyles.powerTable,
        gridTemplateColumns: isMobile
          ? '64px minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)'
          : isTablet
          ? '72px minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)'
          : baseStyles.powerTable.gridTemplateColumns,
        gap: isMobile ? '8px' : isTablet ? '10px' : baseStyles.powerTable.gap,
      },
      eyeLabel: {
        ...baseStyles.eyeLabel,
        fontSize: isMobile ? '0.85rem' : isTablet ? '0.95rem' : baseStyles.eyeLabel.fontSize,
      },
      input: {
        ...baseStyles.input,
        padding: isMobile ? '7px 8px' : isTablet ? '9px 10px' : baseStyles.input.padding,
        fontSize: isMobile ? '0.85rem' : isTablet ? '0.95rem' : baseStyles.input.fontSize,
      },
      additionRow: {
        ...baseStyles.additionRow,
        gridTemplateColumns: isMobile
          ? '90px minmax(0, 1fr) minmax(0, 1fr)'
          : isTablet
          ? '110px minmax(0, 1fr) minmax(0, 1fr)'
          : baseStyles.additionRow.gridTemplateColumns,
        gap: isMobile ? '8px' : isTablet ? '10px' : baseStyles.additionRow.gap,
      },
      copyButton: {
        ...baseStyles.copyButton,
        width: isMobile ? '100%' : 'auto',
      },
      textarea: {
        ...baseStyles.textarea,
        fontSize: isMobile ? '0.9rem' : baseStyles.textarea.fontSize,
        padding: isMobile ? '10px' : baseStyles.textarea.padding,
      },
      section: {
        ...baseStyles.section,
        padding: isMobile ? '16px' : baseStyles.section.padding,
      },
      form: {
        ...baseStyles.form,
        gap: isMobile ? '18px' : baseStyles.form.gap,
      },
    };
  }, [viewportWidth]);
};

// Custom hook for managing prescription state
const usePrescriptionState = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    rightSph: "",
    rightCyl: "",
    rightAxis: "",
    leftSph: "",
    leftCyl: "",
    leftAxis: "",
    rightAddition: "",
    leftAddition: "",
    lensDescription: "",
    supplierName: "",
    urgent: false
  });

  const [errors, setErrors] = useState({});

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const resetForm = useCallback(() => {
    setFormData({
      customerName: "",
      rightSph: "",
      rightCyl: "",
      rightAxis: "",
      leftSph: "",
      leftCyl: "",
      leftAxis: "",
      rightAddition: "",
      leftAddition: "",
      lensDescription: "",
      supplierName: "",
      urgent: false
    });
    setErrors({});
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Check if at least one eye has data
    const hasRightEyeData = formData.rightSph || formData.rightCyl || formData.rightAxis;
    const hasLeftEyeData = formData.leftSph || formData.leftCyl || formData.leftAxis;
    
    if (!hasRightEyeData && !hasLeftEyeData) {
      newErrors.general = "Please fill in at least one field for right or left eye.";
    }

    // Validate power values (must be in 0.25 increments)
    const validatePowerValue = (value, fieldName, displayName) => {
      if (value && (parseFloat(value) % 0.25 !== 0)) {
        newErrors[fieldName] = `${displayName} must be in steps of 0.25`;
      }
    };

    validatePowerValue(formData.rightSph, 'rightSph', 'Right spherical');
    validatePowerValue(formData.rightCyl, 'rightCyl', 'Right cylindrical');
    validatePowerValue(formData.leftSph, 'leftSph', 'Left spherical');
    validatePowerValue(formData.leftCyl, 'leftCyl', 'Left cylindrical');

    // Validate addition values
    const validateAddition = (value, fieldName, displayName) => {
      if (value) {
        const numValue = parseFloat(value);
        if (numValue % 0.25 !== 0 || numValue < 0) {
          newErrors[fieldName] = `${displayName} must be in steps of 0.25 and positive`;
        }
      }
    };

    validateAddition(formData.rightAddition, 'rightAddition', 'Right addition');
    validateAddition(formData.leftAddition, 'leftAddition', 'Left addition');

    // Validate axis values
    const validateAxis = (cylindrical, axis, fieldName, displayName) => {
      if (cylindrical && (!axis || axis < 1 || axis > 180)) {
        newErrors[fieldName] = `${displayName} axis must be between 1 and 180 when cylindrical is provided`;
      }
    };

    validateAxis(formData.rightCyl, formData.rightAxis, 'rightAxis', 'Right');
    validateAxis(formData.leftCyl, formData.leftAxis, 'leftAxis', 'Left');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  return { formData, updateField, resetForm, validateForm, errors };
};

// Custom hook for authentication and branch management
const useAuthAndBranch = () => {
  const [user, setUser] = useState(null);
  const [branchName, setBranchName] = useState("");
  const [branchSwitchChecked, setBranchSwitchChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchBranchData = async () => {
      if (!user?.email) return;
      
      try {
        const docRef = doc(db, "invited_users", user.email);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.shopDefault === BRANCHES.BRANCH_SADAR) {
            setBranchName(BRANCHES.BRANCH_SADAR);
            setBranchSwitchChecked(true);
          } else if (data.shopDefault === BRANCHES.BRANCH_46) {
            setBranchName(BRANCHES.BRANCH_46);
            setBranchSwitchChecked(false);
          }
        }
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    fetchBranchData();
  }, [user]);

  const handleBranchChange = useCallback(() => {
    setBranchSwitchChecked(prev => {
      const newChecked = !prev;
      setBranchName(newChecked ? BRANCHES.BRANCH_SADAR : BRANCHES.BRANCH_46);
      return newChecked;
    });
  }, []);

  return { user, branchName, branchSwitchChecked, handleBranchChange, loading };
};

function SpecsInput() {
  const { formData, updateField, resetForm, validateForm, errors } = usePrescriptionState();
  const { user, branchName, branchSwitchChecked, handleBranchChange, loading } = useAuthAndBranch();
  const styles = useResponsiveStyles();
  const [imageUrl, setImageUrl] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Utility functions
  const formatSpecsPower = useCallback((input) => {
    if (input === "" || input === null || input === undefined) {
      return input;
    }
    const num = parseFloat(input);
    if (isNaN(num)) return input;
    
    let formatted = num.toFixed(2);
    if (num > 0) {
      formatted = '+' + formatted;
    }
    return formatted;
  }, []);

  const divideDescription = useCallback((description, maxLineLength = 50) => {
    if (!description) return [];
    
    const words = description.split(" ");
    const lines = [];
    let currentLine = "";
    
    words.forEach(word => {
      if (currentLine.length + word.length + 1 > maxLineLength) {
        if (currentLine) lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine = currentLine ? currentLine + " " + word : word;
      }
    });
    
    if (currentLine) lines.push(currentLine.trim());
    return lines;
  }, []);

  // Enhanced image generation function
  const generateImage = useCallback(async (data) => {
    setIsGenerating(true);
    
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      
      // Enhanced canvas size and styling
      canvas.width = 800;
      canvas.height = 900;
      
      // Background
      context.fillStyle = data.urgent ? "#FFE6E6" : "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add subtle border
      context.strokeStyle = "#E0E0E0";
      context.lineWidth = 2;
      context.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      
      context.fillStyle = "#000000";
      let yPosition = 60;
      const lineHeight = 35;
      const sectionSpacing = 2.5;
      const tableSpacing = 2;
      
      // Title section with urgent indicator
      if (data.urgent) {
        context.fillStyle = "#FF0000";
        context.font = "bold 48px Arial";
        context.textAlign = "center";
        context.fillText("⚠️ URGENT ⚠️", canvas.width / 2, yPosition);
        yPosition += sectionSpacing * lineHeight;
        context.fillStyle = "#000000";
        context.textAlign = "left";
      }
      
      // Header
      context.font = "bold 32px Arial";
      context.fillText("OPTICAL PRESCRIPTION", 50, yPosition);
      yPosition += sectionSpacing * lineHeight;
      
      // Branch information
      if (branchName) {
        context.font = "20px Arial";
        context.fillStyle = "#666666";
        context.fillText(`Branch: ${branchName.toUpperCase()}`, 50, yPosition);
        yPosition += lineHeight;
        context.fillStyle = "#000000";
      }
      
      yPosition += lineHeight / 2;
      
      // Power table header
      context.font = "bold 24px Arial";
      context.fillText("POWER SPECIFICATIONS", 50, yPosition);
      yPosition += sectionSpacing * lineHeight;
      
      // Column headers with better alignment
      context.font = "18px Arial";
      context.fillStyle = "#444444";
      context.fillText("Eye", 50, yPosition);
      context.fillText("Spherical", 180, yPosition);
      context.fillText("Cylindrical", 320, yPosition);
      context.fillText("Axis", 480, yPosition);
      yPosition += tableSpacing * lineHeight;
      
      context.fillStyle = "#000000";
      context.font = "22px Arial";
      
      // Enhanced cell drawing function
      const drawCell = (text, x, y, isError = false) => {
        const cellWidth = 120;
        const cellHeight = 30;
        
        if (isError) {
          context.fillStyle = "#FFCCCC";
          context.fillRect(x - 5, y - 20, cellWidth, cellHeight);
          context.strokeStyle = "#FF0000";
          context.strokeRect(x - 5, y - 20, cellWidth, cellHeight);
          context.fillStyle = "#000000";
          context.strokeStyle = "#000000";
        }
        
        context.fillText(text || "-", x, y);
      };
      
      // Right eye row
      context.fillText("RIGHT", 50, yPosition);
      drawCell(formatSpecsPower(data.rightSpherical), 180, yPosition);
      drawCell(formatSpecsPower(data.rightCylindrical), 320, yPosition);
      drawCell(data.rightAxis || "-", 480, yPosition, data.rightCylindrical && !data.rightAxis);
      yPosition += tableSpacing * lineHeight;
      
      // Left eye row
      context.fillText("LEFT", 50, yPosition);
      drawCell(formatSpecsPower(data.leftSpherical), 180, yPosition);
      drawCell(formatSpecsPower(data.leftCylindrical), 320, yPosition);
      drawCell(data.leftAxis || "-", 480, yPosition, data.leftCylindrical && !data.leftAxis);
      yPosition += tableSpacing * lineHeight;
      
      // Addition section
      if (data.rightAddition || data.leftAddition) {
        yPosition += lineHeight / 2;
        context.font = "bold 20px Arial";
        context.fillText("ADDITION", 50, yPosition);
        yPosition += lineHeight;
        
        context.font = "22px Arial";
        if (data.rightAddition === data.leftAddition && data.rightAddition) {
          context.fillText(`${formatSpecsPower(data.rightAddition)} (Both Eyes)`, 180, yPosition);
        } else {
          if (data.rightAddition) {
            context.fillText(`${formatSpecsPower(data.rightAddition)} (Right)`, 180, yPosition);
          }
          if (data.leftAddition) {
            context.fillText(`${formatSpecsPower(data.leftAddition)} (Left)`, 350, yPosition);
          }
        }
        yPosition += sectionSpacing * lineHeight;
      }
      
      // Separator line
      yPosition += lineHeight / 2;
      context.beginPath();
      context.moveTo(50, yPosition);
      context.lineTo(750, yPosition);
      context.strokeStyle = "#CCCCCC";
      context.stroke();
      context.strokeStyle = "#000000";
      yPosition += lineHeight;
      
      // Additional information section
      if (data.lensDescription) {
        context.font = "bold 20px Arial";
        context.fillText("LENS DESCRIPTION:", 50, yPosition);
        yPosition += lineHeight;
        
        context.font = "18px Arial";
        const descLines = divideDescription(data.lensDescription, 60);
        descLines.forEach(line => {
          context.fillText(line, 50, yPosition);
          yPosition += lineHeight * 0.8;
        });
        yPosition += lineHeight / 2;
      }
      
      // Customer and supplier information
      context.font = "18px Arial";
      if (data.customerName) {
        context.fillText(`Customer: ${data.customerName}`, 50, yPosition);
        yPosition += lineHeight;
      }
      
      if (data.supplierName) {
        context.fillText(`Supplier: ${data.supplierName}`, 50, yPosition);
        yPosition += lineHeight;
      }
      
      // Footer with timestamp
      yPosition = canvas.height - 40;
      context.font = "14px Arial";
      context.fillStyle = "#888888";
      const timestamp = new Date().toLocaleString();
      context.fillText(`Generated on: ${timestamp}`, 50, yPosition);
      
      // Convert canvas to blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
          setImageBlob(blob);
          
          // Smooth scroll to image
          // setTimeout(() => {
          //   const imageElement = document.getElementById('generated-image');
          //   if (imageElement) {
          //     imageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          //   }
          // }, 100);
          
          resolve();
        });
      });
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Error generating image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [formatSpecsPower, divideDescription, branchName]);

  // Enhanced copy addition functionality
  const handleCopyAddition = useCallback(() => {
    const { rightAddition, leftAddition } = formData;
    
    if (leftAddition === "" && rightAddition !== "") {
      updateField('leftAddition', rightAddition);
    } else if (rightAddition === "" && leftAddition !== "") {
      updateField('rightAddition', leftAddition);
    } else if (rightAddition !== "") {
      updateField('leftAddition', rightAddition);
    }
  }, [formData, updateField]);

  // Enhanced save to database functionality
  const saveLensOrder = useCallback(async (orderData) => {
    setIsSaving(true);
    try {
      const docRef = await addDoc(collection(db, "lens_orders"), {
        ...orderData,
        branchName,
        createdAt: new Date().toISOString(),
        createdBy: user?.email || 'unknown'
      });
      
      setSuccessMessage("Order saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      return docRef.id;
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Error saving order. Please try again.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [branchName, user]);

  // Handle form submission for image generation
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await generateImage({
      customerName: formData.customerName,
      rightSpherical: formData.rightSph,
      rightCylindrical: formData.rightCyl,
      rightAxis: formData.rightAxis,
      leftSpherical: formData.leftSph,
      leftCylindrical: formData.leftCyl,
      leftAxis: formData.leftAxis,
      lensDescription: formData.lensDescription,
      supplierName: formData.supplierName,
      urgent: formData.urgent,
      rightAddition: formData.rightAddition,
      leftAddition: formData.leftAddition,
    });
  }, [formData, validateForm, generateImage]);

  // Handle save to database
  const handleSaveToDatabase = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    await saveLensOrder({
      customerName: formData.customerName || "",
      rightSpherical: formatSpecsPower(formData.rightSph) || "0.00",
      rightCylindrical: formatSpecsPower(formData.rightCyl) || "0.00",
      rightAxis: formData.rightAxis || 0,
      leftSpherical: formatSpecsPower(formData.leftSph) || "0.00",
      leftCylindrical: formatSpecsPower(formData.leftCyl) || "0.00",
      leftAxis: formData.leftAxis || 0,
      lensDescription: formData.lensDescription || "",
      supplierName: formData.supplierName || "",
      urgent: formData.urgent || false,
      rightAddition: formatSpecsPower(formData.rightAddition) || "0.00",
      leftAddition: formatSpecsPower(formData.leftAddition) || "0.00",
    });
  }, [formData, validateForm, saveLensOrder, formatSpecsPower]);

  // Handle form reset
  const handleReset = useCallback(() => {
    resetForm();
    setImageUrl(null);
    setImageBlob(null);
    setSuccessMessage("");
    // Scroll to the top of the page wrapper
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [resetForm]);

  // Handle right click on generated image
  const handleImageRightClick = useCallback((e) => {
    const rightClickEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      button: 2
    });
    e.target.dispatchEvent(rightClickEvent);
  }, []);

  if (loading) {
    return (
      <div style={{ ...styles.container, textAlign: 'center' }}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="specs-input-wrapper" style={styles.pageWrapper}>
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <h1 style={styles.title}>Optical Prescription Manager</h1>
          
          {/* Branch Selector */}
          <div style={styles.branchSelector}>
            <span style={styles.branchLabel}>Branch:</span>
            <Switch 
              checked={branchSwitchChecked} 
              onChange={handleBranchChange}
              color="primary"
            />
            <span style={styles.branchLabel}>{branchName.toUpperCase()}</span>
          </div>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          {/* Power Specifications Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              👁️ Power Specifications
            </h3>
            
            <div style={styles.powerTable}>
              {/* Headers */}
              <div></div>
              <div style={{ ...styles.eyeLabel, fontSize: '0.9rem' }}>Spherical</div>
              <div style={{ ...styles.eyeLabel, fontSize: '0.9rem' }}>Cylindrical</div>
              <div style={{ ...styles.eyeLabel, fontSize: '0.9rem' }}>Axis</div>
              
              {/* Right Eye Row */}
              <div style={styles.eyeLabel}>RIGHT</div>
              <input
                type="number"
                step="0.25"
                value={formData.rightSph}
                onChange={(e) => updateField('rightSph', e.target.value)}
                placeholder="Sph"
                style={{
                  ...styles.input,
                  borderColor: errors.rightSph ? '#dc3545' : styles.input.borderColor
                }}
              />
              <input
                type="number"
                step="0.25"
                value={formData.rightCyl}
                onChange={(e) => updateField('rightCyl', e.target.value)}
                placeholder="Cyl"
                style={{
                  ...styles.input,
                  borderColor: errors.rightCyl ? '#dc3545' : styles.input.borderColor
                }}
              />
              <input
                type="number"
                min="1"
                max="180"
                value={formData.rightAxis}
                onChange={(e) => updateField('rightAxis', e.target.value)}
                placeholder="Axis"
                style={{
                  ...styles.input,
                  borderColor: errors.rightAxis ? '#dc3545' : styles.input.borderColor
                }}
              />
              
              {/* Left Eye Row */}
              <div style={styles.eyeLabel}>LEFT</div>
              <input
                type="number"
                step="0.25"
                value={formData.leftSph}
                onChange={(e) => updateField('leftSph', e.target.value)}
                placeholder="Sph"
                style={{
                  ...styles.input,
                  borderColor: errors.leftSph ? '#dc3545' : styles.input.borderColor
                }}
              />
              <input
                type="number"
                step="0.25"
                value={formData.leftCyl}
                onChange={(e) => updateField('leftCyl', e.target.value)}
                placeholder="Cyl"
                style={{
                  ...styles.input,
                  borderColor: errors.leftCyl ? '#dc3545' : styles.input.borderColor
                }}
              />
              <input
                type="number"
                min="1"
                max="180"
                value={formData.leftAxis}
                onChange={(e) => updateField('leftAxis', e.target.value)}
                placeholder="Axis"
                style={{
                  ...styles.input,
                  borderColor: errors.leftAxis ? '#dc3545' : styles.input.borderColor
                }}
              />
            </div>

            {/* Addition Section */}
            <div style={styles.additionRow}>
              <div style={styles.eyeLabel}>ADDITION</div>
              <input
                type="number"
                step="0.25"
                min="0"
                value={formData.rightAddition}
                onChange={(e) => updateField('rightAddition', e.target.value)}
                placeholder="Right Add"
                style={{
                  ...styles.input,
                  borderColor: errors.rightAddition ? '#dc3545' : styles.input.borderColor
                }}
              />
              <input
                type="number"
                step="0.25"
                min="0"
                value={formData.leftAddition}
                onChange={(e) => updateField('leftAddition', e.target.value)}
                placeholder="Left Add"
                style={{
                  ...styles.input,
                  borderColor: errors.leftAddition ? '#dc3545' : styles.input.borderColor
                }}
              />
            </div>
            
            <button
              type="button"
              onClick={handleCopyAddition}
              style={{ ...styles.copyButton }}
              className="hover-info"
            >
              Copy Addition
            </button>
            
            {/* Display validation errors */}
            {Object.entries(errors).map(([field, error]) => (
              <div key={field} style={styles.errorText}>{error}</div>
            ))}
          </div>

          {/* Lens Description Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              📝 Lens Description
            </h3>
            <textarea
              value={formData.lensDescription}
              onChange={(e) => updateField('lensDescription', e.target.value)}
              placeholder="Enter detailed lens description..."
              maxLength={142}
              style={styles.textarea}
            />
            <div style={{ fontSize: '0.8rem', color: '#6c757d', textAlign: 'right' }}>
              {formData.lensDescription.length}/142 characters
            </div>
          </div>

          {/* Customer Information Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              👤 Customer & Supplier Information
            </h3>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Customer Name:
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => updateField('customerName', e.target.value)}
                  placeholder="Enter customer name"
                  style={styles.input}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Supplier Name:
                </label>
                <input
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) => updateField('supplierName', e.target.value)}
                  placeholder="Enter supplier name"
                  style={styles.input}
                />
              </div>
              
              <div style={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="urgent-checkbox"
                  checked={formData.urgent}
                  onChange={(e) => updateField('urgent', e.target.checked)}
                  style={styles.checkbox}
                />
                <label htmlFor="urgent-checkbox" style={styles.checkboxLabel}>
                  🚨 Mark as Urgent
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.buttonGroup}>
            <button
              type="submit"
              disabled={isGenerating}
              style={{ ...styles.button, ...styles.primaryButton }}
              className="hover-primary"
            >
              {isGenerating ? (
                <>
                  <span style={styles.loadingSpinner}></span>
                  <span style={{ marginLeft: '8px' }}>Generating...</span>
                </>
              ) : (
                '🖼️ Generate Image'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleSaveToDatabase}
              disabled={isSaving}
              style={{ ...styles.button, ...styles.secondaryButton }}
              className="hover-secondary"
            >
              {isSaving ? (
                <>
                  <span style={styles.loadingSpinner}></span>
                  <span style={{ marginLeft: '8px' }}>Saving...</span>
                </>
              ) : (
                '💾 Save to Database'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleReset}
              style={{ ...styles.button, ...styles.dangerButton }}
              className="hover-danger"
            >
              🔄 Reset Form
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div style={{ ...styles.successText, textAlign: 'center', fontSize: '1rem' }}>
              ✅ {successMessage}
            </div>
          )}
        </form>

        {/* Generated Image Section */}
        {imageUrl && (
          <div style={styles.imageSection}>
            <h3 style={{ marginBottom: '20px', color: '#495057' }}>
              📸 Generated Prescription Image
            </h3>
            <img
              id="generated-image"
              src={imageUrl}
              alt="Generated Prescription"
              style={styles.generatedImage}
              onClick={handleImageRightClick}
            />
            <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#6c757d' }}>
              Right-click on the image to save or share
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SpecsInput;