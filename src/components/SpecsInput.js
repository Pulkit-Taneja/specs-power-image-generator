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
    width: '100%',
    boxSizing: 'border-box',
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
    width: '100%',
    boxSizing: 'border-box',
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

  imageModeButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: '20px',
  },

  modeButton: {
    padding: '10px 18px',
    borderRadius: '6px',
    border: '1px solid #667eea',
    backgroundColor: '#ffffff',
    color: '#667eea',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    minWidth: '120px',
  },

  modeButtonActive: {
    backgroundColor: '#667eea',
    color: '#ffffff',
    cursor: 'default',
    boxShadow: '0 6px 12px rgba(102, 126, 234, 0.25)',
  },

  transposeButton: {
    padding: '10px 18px',
    borderRadius: '6px',
    border: '1px solid #ff9f43',
    backgroundColor: '#ffffff',
    color: '#ff9f43',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    minWidth: '120px',
  },

  transposeButtonActive: {
    backgroundColor: '#ff9f43',
    color: '#ffffff',
    boxShadow: '0 6px 12px rgba(255, 159, 67, 0.25)',
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

const POWER_INPUT_PATTERN = /^[-+]?(\d+(\.\d*)?|\.\d*)?$/;

const DISPLAY_MODES = Object.freeze({
  DISTANCE: 'distance',
  NEAR: 'near',
  COMPLETE: 'complete',
});

const DISPLAY_MODE_LABELS = {
  [DISPLAY_MODES.DISTANCE]: 'Distance',
  [DISPLAY_MODES.NEAR]: 'Near',
  [DISPLAY_MODES.COMPLETE]: 'Complete',
};

const DISPLAY_MODE_ORDER = [
  DISPLAY_MODES.DISTANCE,
  DISPLAY_MODES.NEAR,
  DISPLAY_MODES.COMPLETE,
];

const TRANSPOSE_LABEL = 'Transpose';

const hasValue = (value) => value !== null && value !== undefined && value !== "";

const parseNullableFloat = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const normalizedValue = typeof value === "string" ? value.trim() : value;
  if (normalizedValue === "-") {
    return 0;
  }
  const parsed = parseFloat(normalizedValue);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseNullableInt = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

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
      imageModeButtons: {
        ...baseStyles.imageModeButtons,
      },
      modeButton: {
        ...baseStyles.modeButton,
        minWidth: isMobile ? 'calc(50% - 8px)' : isTablet ? '110px' : baseStyles.modeButton.minWidth,
        padding: isMobile ? '9px 12px' : isTablet ? '10px 16px' : baseStyles.modeButton.padding,
      },
      modeButtonActive: {
        ...baseStyles.modeButtonActive,
      },
      transposeButton: {
        ...baseStyles.transposeButton,
        minWidth: isMobile ? 'calc(50% - 8px)' : isTablet ? '110px' : baseStyles.transposeButton.minWidth,
        padding: isMobile ? '9px 12px' : isTablet ? '10px 16px' : baseStyles.transposeButton.padding,
      },
      transposeButtonActive: {
        ...baseStyles.transposeButtonActive,
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
    const validateAxis = (axis, fieldName, displayName) => {
      if (!axis) {
        return;
      }

      const numericAxis = parseInt(axis, 10);
      if (Number.isNaN(numericAxis) || numericAxis < 1 || numericAxis > 180) {
        newErrors[fieldName] = `${displayName} axis must be between 1 and 180`;
      }
    };

    validateAxis(formData.rightAxis, 'rightAxis', 'Right');
    validateAxis(formData.leftAxis, 'leftAxis', 'Left');

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
  const [displayMode, setDisplayMode] = useState(DISPLAY_MODES.COMPLETE);
  const [isTranspose, setIsTranspose] = useState(false);
  const [lastGeneratedData, setLastGeneratedData] = useState(null);

  // Utility functions
  const formatSpecsPower = useCallback((input) => {
    if (input === "" || input === null || input === undefined) {
      return input;
    }
    const num = parseFloat(input);
    if (isNaN(num)) return input;
    
    const formatted = num.toFixed(2);
    if (formatted.startsWith('-')) {
      return formatted;
    }
    return formatted;
  }, []);

  const computePowerDisplay = useCallback((data, options = {}) => {
    if (!data) {
      return null;
    }

    const selectedMode = options.mode ?? displayMode;
    const shouldTranspose = options.transpose ?? isTranspose;

    const formatSignedPowerForDisplay = (value) => {
      if (value === "" || value === null || value === undefined) {
        return "";
      }

      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed === "") {
          return "";
        }
        if (trimmed.toUpperCase() === "PLN") {
          return "PLN";
        }
        if (trimmed === "-") {
          return "-";
        }
      }

      const numericValue = typeof value === "number" ? value : parseFloat(value);
      if (Number.isNaN(numericValue)) {
        return value;
      }

      const roundedValue = Math.round(numericValue * 100) / 100;
      const formatted = formatSpecsPower(roundedValue);

      if (Math.abs(roundedValue) < 0.0001) {
        return "+0.00";
      }

      if (roundedValue > 0) {
        return formatted.startsWith("+") ? formatted : `+${formatted}`;
      }

      return formatted;
    };

    const powerRows = [
      {
        label: "RIGHT",
        sphValue: data.rightSpherical,
        cylValue: data.rightCylindrical,
        axisValue: data.rightAxis,
        additionValue: data.rightAddition,
      },
      {
        label: "LEFT",
        sphValue: data.leftSpherical,
        cylValue: data.leftCylindrical,
        axisValue: data.leftAxis,
        additionValue: data.leftAddition,
      },
    ];

    const rows = powerRows.map(({ label, sphValue, cylValue, axisValue, additionValue }) => {
      const rowHasData = hasValue(sphValue) || hasValue(cylValue) || hasValue(axisValue);

      if (!rowHasData) {
        return {
          label,
          spherical: "",
          cylindrical: "",
          axis: "",
          axisError: false,
          hasData: false,
        };
      }

      let workingSph = parseNullableFloat(sphValue);
      let workingCyl = parseNullableFloat(cylValue);
      let workingAxis = parseNullableInt(axisValue);
      const additionNumeric = parseNullableFloat(additionValue);

      if (selectedMode === DISPLAY_MODES.NEAR && additionNumeric !== null) {
        const baseSphere = workingSph !== null ? workingSph : 0;
        workingSph = baseSphere + additionNumeric;
      }

      if (shouldTranspose) {
        if (workingCyl !== null && workingAxis !== null) {
          const pivotSph = workingSph !== null ? workingSph : 0;
          const transposedSph = pivotSph + workingCyl;
          const transposedCyl = -workingCyl;
          let transposedAxis = workingAxis <= 90 ? workingAxis + 90 : workingAxis - 90;
          if (transposedAxis <= 0) transposedAxis += 180;
          if (transposedAxis > 180) transposedAxis -= 180;

          workingSph = transposedSph;
          workingCyl = transposedCyl;
          workingAxis = transposedAxis;
        } else if (workingCyl !== null && workingAxis === null) {
          const pivotSph = workingSph !== null ? workingSph : 0;
          workingSph = pivotSph + workingCyl;
          workingCyl = -workingCyl;
        } else if (workingCyl === null && workingAxis !== null) {
          let transposedAxis = workingAxis <= 90 ? workingAxis + 90 : workingAxis - 90;
          if (transposedAxis <= 0) transposedAxis += 180;
          if (transposedAxis > 180) transposedAxis -= 180;
          workingAxis = transposedAxis;
        }
      }

      const sphIsNumeric = workingSph !== null && !Number.isNaN(workingSph);
      const cylIsNumeric = workingCyl !== null && !Number.isNaN(workingCyl);
      const axisIsNumeric = workingAxis !== null && !Number.isNaN(workingAxis);

      let displaySph = "";
      let displayCyl = "";
      let displayAxis = "";

      if (sphIsNumeric) {
        displaySph = formatSpecsPower(workingSph);
      } else if (hasValue(sphValue)) {
        displaySph = sphValue;
      }

      if (cylIsNumeric) {
        displayCyl = formatSpecsPower(workingCyl);
      } else if (hasValue(cylValue)) {
        displayCyl = cylValue;
      }

      if (cylIsNumeric && workingCyl === 0) {
        displayCyl = "";
      }

      if (axisIsNumeric) {
        displayAxis = String(workingAxis);
      } else if (hasValue(axisValue)) {
        displayAxis = axisValue;
      }

      const cylinderHasValue = displayCyl !== "";
      const axisPresent = axisIsNumeric || hasValue(axisValue);
      const axisError = cylinderHasValue && !axisPresent;

      if (sphIsNumeric && workingSph === 0) {
        if (!cylinderHasValue && !axisPresent) {
          displaySph = "PLN";
        } else if (cylinderHasValue) {
          displaySph = "";
        }
      }

      return {
        label,
        spherical: formatSignedPowerForDisplay(displaySph),
        cylindrical: formatSignedPowerForDisplay(displayCyl),
        axis: displayAxis,
        axisError,
        hasData: true,
      };
    });

    const rightAdditionHasValue = hasValue(data.rightAddition);
    const leftAdditionHasValue = hasValue(data.leftAddition);
    const shouldDisplayAdditionSection =
      selectedMode === DISPLAY_MODES.COMPLETE && (rightAdditionHasValue || leftAdditionHasValue);

    const addition = {
      shouldDisplay: shouldDisplayAdditionSection,
      right: shouldDisplayAdditionSection && rightAdditionHasValue
        ? formatSignedPowerForDisplay(data.rightAddition)
        : "",
      left: shouldDisplayAdditionSection && leftAdditionHasValue
        ? formatSignedPowerForDisplay(data.leftAddition)
        : "",
    };

    return {
      rows,
      addition,
      metadata: {
        mode: selectedMode,
        transposeApplied: shouldTranspose,
      },
    };
  }, [displayMode, isTranspose, formatSpecsPower]);

  const createGenerationPayload = useCallback(() => ({
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
  }), [formData]);

  const handlePowerInputChange = useCallback((field) => (event) => {
    const { value } = event.target;
    // if (POWER_INPUT_PATTERN.test(value)) {
      updateField(field, value);
    // }
  }, [updateField]);

  const handlePowerBlur = useCallback((field) => (event) => {
    const rawValue = event.target.value;
    const trimmedValue = typeof rawValue === "string" ? rawValue.trim() : "";
    const isCylinderField = field === "rightCyl" || field === "leftCyl";
    const isAdditionField = field === "rightAddition" || field === "leftAddition";

    const axisField = isCylinderField
      ? field === "rightCyl" ? "rightAxis" : "leftAxis"
      : null;

    const eyePrefix = field.startsWith("right") ? "right" : field.startsWith("left") ? "left" : null;

    const clearLinkedAxis = () => {
      if (axisField && formData[axisField]) {
        updateField(axisField, "");
      }
    };

    if (!trimmedValue) {
      if (rawValue !== "") {
        updateField(field, "");
      }
      if (isCylinderField) {
        clearLinkedAxis();
      }
      if (isAdditionField && eyePrefix) {
        const sph = formData[`${eyePrefix}Sph`];
        const cyl = formData[`${eyePrefix}Cyl`];
        const axis = formData[`${eyePrefix}Axis`];
        if (!sph && !cyl && !axis) {
          updateField(field, "");
        }
      }
      return;
    }

    const parsedValue = parseFloat(trimmedValue);
    if (Number.isNaN(parsedValue)) {
      updateField(field, "");
      if (isCylinderField) {
        clearLinkedAxis();
      }
      return;
    }

    if (isCylinderField && parsedValue === 0) {
      updateField(field, "");
      clearLinkedAxis();
      return;
    }

    const formattedValue = formatSpecsPower(parsedValue);
    if (formattedValue !== rawValue) {
      updateField(field, formattedValue);
    }

    if (isAdditionField && eyePrefix) {
      const sph = formData[`${eyePrefix}Sph`];
      const cyl = formData[`${eyePrefix}Cyl`];
      const axis = formData[`${eyePrefix}Axis`];
      if (!sph && !cyl && !axis) {
        updateField(field, "");
      }
    }
  }, [formatSpecsPower, updateField, formData]);

  const handleAxisBlur = useCallback((field) => (event) => {
    const rawValue = event.target.value;
    const trimmedValue = typeof rawValue === "string" ? rawValue.trim() : "";
    const isRightEye = field === "rightAxis";
    const cylinderField = isRightEye ? "rightCyl" : "leftCyl";
    const cylinderRawValue = formData[cylinderField];
    const cylinderTrimmed = typeof cylinderRawValue === "string" ? cylinderRawValue.trim() : "";

    const cylinderNumeric = cylinderTrimmed ? parseFloat(cylinderTrimmed) : null;
    const cylinderIsZero = cylinderNumeric === 0;
    const shouldClearAxis = !cylinderTrimmed || cylinderIsZero;

    if (shouldClearAxis) {
      if (formData[field]) {
        updateField(field, "");
      }
      return;
    }

    if (!trimmedValue) {
      if (rawValue !== "") {
        updateField(field, "");
      }
      return;
    }

    const numericAxis = parseInt(trimmedValue, 10);
    if (Number.isNaN(numericAxis)) {
      updateField(field, "");
      return;
    }

    const clampedAxis = Math.min(Math.max(numericAxis, 1), 180);
    const normalizedAxis = String(clampedAxis);
    if (normalizedAxis !== rawValue) {
      updateField(field, normalizedAxis);
    }
  }, [formData, updateField]);

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
  const generateImage = useCallback(async (data, options = {}) => {
    const { mode = DISPLAY_MODES.COMPLETE, transpose = false, showLoading = true } = options;

    if (showLoading) {
      setIsGenerating(true);
    }

    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = 800;
      canvas.height = 900;

      context.fillStyle = data.urgent ? "#FFE6E6" : "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.strokeStyle = "#E0E0E0";
      context.lineWidth = 2;
      context.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      context.fillStyle = "#000000";
      let yPosition = 60;
      const lineHeight = 35;
      const sectionSpacing = 2.5;
      const tableSpacing = 2;
      const selectedMode = mode;
      const shouldTranspose = Boolean(transpose);

      if (data.urgent) {
        context.fillStyle = "#FF0000";
        context.font = "bold 48px Arial";
        context.textAlign = "center";
        context.fillText("⚠️ URGENT ⚠️", canvas.width / 2, yPosition);
        yPosition += sectionSpacing * lineHeight;
        context.fillStyle = "#000000";
        context.textAlign = "left";
      }

      context.font = "bold 32px Arial";
      context.fillText("OPTICAL PRESCRIPTION", 50, yPosition);
      yPosition += sectionSpacing * lineHeight;

      if (branchName) {
        context.font = "20px Arial";
        context.fillStyle = "#666666";
        context.fillText(`Branch: ${branchName.toUpperCase()}`, 50, yPosition);
        yPosition += lineHeight;
        context.fillStyle = "#000000";
      }

      yPosition += lineHeight / 2;

      context.font = "bold 24px Arial";
      context.fillText("POWER SPECIFICATIONS", 50, yPosition);
      yPosition += sectionSpacing * lineHeight;

      context.font = "18px Arial";
      context.fillStyle = "#444444";
      context.fillText("Eye", 50, yPosition);
      context.fillText("Spherical", 180, yPosition);
      context.fillText("Cylindrical", 320, yPosition);
      context.fillText("Axis", 480, yPosition);
      yPosition += tableSpacing * lineHeight;

      context.fillStyle = "#000000";
      context.font = "22px Arial";

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

      const displayData = computePowerDisplay(data, {
        mode: selectedMode,
        transpose: shouldTranspose,
      });

      const rowsToRender = displayData?.rows ?? [];
      let renderedPowerRows = 0;

      rowsToRender.forEach(({ label, spherical, cylindrical, axis, axisError, hasData }) => {
        if (!hasData) {
          return;
        }

        context.fillText(label, 50, yPosition);
        drawCell(spherical, 180, yPosition);
        drawCell(cylindrical, 320, yPosition);
        drawCell(axis, 480, yPosition, axisError);
        yPosition += tableSpacing * lineHeight;
        renderedPowerRows += 1;
      });

      if (renderedPowerRows === 0) {
        yPosition += lineHeight;
      }

      const additionData = displayData?.addition;
      const shouldDisplayAdditionSection = Boolean(additionData?.shouldDisplay);

      if (shouldDisplayAdditionSection) {
        yPosition += lineHeight / 2;
        context.font = "bold 20px Arial";
        context.fillText("ADDITION", 50, yPosition);
        yPosition += lineHeight;

        context.font = "22px Arial";
        const rightAdditionFormatted = additionData?.right || "";
        const leftAdditionFormatted = additionData?.left || "";

        if (rightAdditionFormatted && leftAdditionFormatted && rightAdditionFormatted === leftAdditionFormatted) {
          context.fillText(`${rightAdditionFormatted} (Both Eyes)`, 180, yPosition);
        } else {
          if (rightAdditionFormatted) {
            context.fillText(`${rightAdditionFormatted} (Right)`, 180, yPosition);
          }
          if (leftAdditionFormatted) {
            context.fillText(`${leftAdditionFormatted} (Left)`, 350, yPosition);
          }
        }
        yPosition += sectionSpacing * lineHeight;
      }

      yPosition += lineHeight / 2;
      context.beginPath();
      context.moveTo(50, yPosition);
      context.lineTo(750, yPosition);
      context.strokeStyle = "#CCCCCC";
      context.stroke();
      context.strokeStyle = "#000000";
      yPosition += lineHeight;

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

      context.font = "18px Arial";
      if (data.customerName) {
        context.fillText(`Customer: ${data.customerName}`, 50, yPosition);
        yPosition += lineHeight;
      }

      if (data.supplierName) {
        context.fillText(`Supplier: ${data.supplierName}`, 50, yPosition);
        yPosition += lineHeight;
      }

      yPosition = canvas.height - 40;
      context.font = "14px Arial";
      context.fillStyle = "#888888";
      const timestamp = new Date().toLocaleString();
      context.fillText(`Generated on: ${timestamp}`, 50, yPosition);

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          if (imageUrl) {
            URL.revokeObjectURL(imageUrl);
          }
          setImageUrl(url);
          setImageBlob(blob);
          resolve();
        });
      });
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Error generating image. Please try again.");
    } finally {
      if (showLoading) {
        setIsGenerating(false);
      }
    }
  }, [computePowerDisplay, divideDescription, branchName, imageUrl]);

  const handleModeChange = useCallback(async (mode) => {
    if (!lastGeneratedData || mode === displayMode) {
      return;
    }

    setDisplayMode(mode);
    await generateImage(lastGeneratedData, { mode, transpose: isTranspose, showLoading: false });
  }, [lastGeneratedData, displayMode, isTranspose, generateImage]);

  const handleTransposeToggle = useCallback(async () => {
    const nextTranspose = !isTranspose;
    setIsTranspose(nextTranspose);

    if (!lastGeneratedData) {
      return;
    }

    await generateImage(lastGeneratedData, {
      mode: displayMode,
      transpose: nextTranspose,
      showLoading: false,
    });
  }, [isTranspose, lastGeneratedData, displayMode, generateImage]);

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

    const generationPayload = createGenerationPayload();

    setDisplayMode(DISPLAY_MODES.COMPLETE);
    setIsTranspose(false);
    setLastGeneratedData(generationPayload);

    await generateImage(generationPayload, { mode: DISPLAY_MODES.COMPLETE, transpose: false });
  }, [validateForm, createGenerationPayload, generateImage]);

  // Handle save to database
  const handleSaveToDatabase = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    const inputPower = {
      rightSpherical: formatSpecsPower(formData.rightSph) || "0.00",
      rightCylindrical: formatSpecsPower(formData.rightCyl) || "0.00",
      rightAxis: formData.rightAxis || 0,
      leftSpherical: formatSpecsPower(formData.leftSph) || "0.00",
      leftCylindrical: formatSpecsPower(formData.leftCyl) || "0.00",
      leftAxis: formData.leftAxis || 0,
      rightAddition: formatSpecsPower(formData.rightAddition) || "0.00",
      leftAddition: formatSpecsPower(formData.leftAddition) || "0.00",
    };

    const sourceData = lastGeneratedData || createGenerationPayload();
    const orderedDisplay = computePowerDisplay(sourceData, {
      mode: displayMode,
      transpose: isTranspose,
    });

    const formatAxisForStorage = (value) => {
      const parsedAxis = parseNullableInt(value);
      if (!parsedAxis) {
        return "";
      }
      return String(parsedAxis);
    };

    const defaultOrderedPower = {
      mode: displayMode,
      transposeApplied: isTranspose,
      rightSpherical: inputPower.rightSpherical,
      rightCylindrical: inputPower.rightCylindrical,
      rightAxis: formatAxisForStorage(formData.rightAxis),
      leftSpherical: inputPower.leftSpherical,
      leftCylindrical: inputPower.leftCylindrical,
      leftAxis: formatAxisForStorage(formData.leftAxis),
      rightAddition: "",
      leftAddition: "",
    };

    let orderedPower = defaultOrderedPower;

    if (orderedDisplay) {
      const rightRow = orderedDisplay.rows.find((row) => row.label === "RIGHT");
      const leftRow = orderedDisplay.rows.find((row) => row.label === "LEFT");

      orderedPower = {
        mode: orderedDisplay.metadata.mode,
        transposeApplied: orderedDisplay.metadata.transposeApplied,
        rightSpherical: rightRow ? rightRow.spherical || "" : defaultOrderedPower.rightSpherical,
        rightCylindrical: rightRow ? rightRow.cylindrical || "" : defaultOrderedPower.rightCylindrical,
        rightAxis: rightRow ? rightRow.axis || "" : defaultOrderedPower.rightAxis,
        leftSpherical: leftRow ? leftRow.spherical || "" : defaultOrderedPower.leftSpherical,
        leftCylindrical: leftRow ? leftRow.cylindrical || "" : defaultOrderedPower.leftCylindrical,
        leftAxis: leftRow ? leftRow.axis || "" : defaultOrderedPower.leftAxis,
        rightAddition: orderedDisplay.addition.shouldDisplay ? orderedDisplay.addition.right : "",
        leftAddition: orderedDisplay.addition.shouldDisplay ? orderedDisplay.addition.left : "",
      };
    }

    await saveLensOrder({
      customerName: formData.customerName || "",
      lensDescription: formData.lensDescription || "",
      supplierName: formData.supplierName || "",
      urgent: formData.urgent || false,
      input_power: inputPower,
      ordered_power: orderedPower,
    });
  }, [
    validateForm,
    saveLensOrder,
    formatSpecsPower,
    formData,
    lastGeneratedData,
    createGenerationPayload,
    computePowerDisplay,
    displayMode,
    isTranspose,
  ]);

  // Handle form reset
  const handleReset = useCallback(() => {
    resetForm();
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
    setImageBlob(null);
    setSuccessMessage("");
    setDisplayMode(DISPLAY_MODES.COMPLETE);
    setIsTranspose(false);
    setLastGeneratedData(null);
    // Scroll to the top of the page wrapper
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [resetForm, imageUrl]);

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
                onChange={handlePowerInputChange('rightSph')}
                onBlur={handlePowerBlur('rightSph')}
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
                onChange={handlePowerInputChange('rightCyl')}
                onBlur={handlePowerBlur('rightCyl')}
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
                onBlur={handleAxisBlur('rightAxis')}
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
                onChange={handlePowerInputChange('leftSph')}
                onBlur={handlePowerBlur('leftSph')}
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
                onChange={handlePowerInputChange('leftCyl')}
                onBlur={handlePowerBlur('leftCyl')}
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
                onBlur={handleAxisBlur('leftAxis')}
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
                onChange={handlePowerInputChange('rightAddition')}
                onBlur={handlePowerBlur('rightAddition')}
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
                onChange={handlePowerInputChange('leftAddition')}
                onBlur={handlePowerBlur('leftAddition')}
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
            <div style={styles.imageModeButtons}>
              {DISPLAY_MODE_ORDER.map((modeKey) => (
                <button
                  key={modeKey}
                  type="button"
                  onClick={() => handleModeChange(modeKey)}
                  disabled={displayMode === modeKey}
                  aria-pressed={displayMode === modeKey}
                  style={{
                    ...styles.modeButton,
                    ...(displayMode === modeKey ? styles.modeButtonActive : {}),
                  }}
                >
                  {DISPLAY_MODE_LABELS[modeKey]}
                </button>
              ))}
              <button
                type="button"
                onClick={handleTransposeToggle}
                aria-pressed={isTranspose}
                style={{
                  ...styles.transposeButton,
                  ...(isTranspose ? styles.transposeButtonActive : {}),
                }}
              >
                {TRANSPOSE_LABEL}
              </button>
            </div>
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