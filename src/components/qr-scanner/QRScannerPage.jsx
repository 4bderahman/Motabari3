import { useState, useEffect, useCallback, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import jsQR from "jsqr";
import axios from "axios";
import {
  Calendar,
  Droplet,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Camera,
  AlertCircle,
  Loader2,
  Scan,
  Upload,
} from "lucide-react";
import { BASE_URL } from "../../utility-functions/base-url";
import Toast from "../ui/Toast";

// Constants for QR scanner
const qrcodeRegionId = "html5qr-code-full-region";
const qrScannerConfig = {
  fps: 10,
  qrbox: 250,
  aspectRatio: 1.0,
  disableFlip: false,
};

function QRScannerPage() {
  // Core scanner states
  const [scanData, setScanData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);
  const [resetInProgress, setResetInProgress] = useState(false);
  const [scanMode, setScanMode] = useState(null); // 'camera' or 'manual'
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  
  // Refs for tracking state across renders
  const abortControllerRef = useRef(new AbortController());
  const cleanupTimeoutRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Emergency cleanup function to forcibly release all scanner resources
  const emergencyCleanup = useCallback(async () => {
    console.log("Emergency cleanup of scanner resources");
    
    // Clean up html5-qrcode instance if it exists
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error("Error stopping html5QrCode:", err);
      }
      html5QrCodeRef.current = null;
    }
    
    // Find and stop all video elements as a fallback
    try {
      const videoElements = document.querySelectorAll('video');
      for (const video of videoElements) {
        try {
          if (video.srcObject) {
            const tracks = video.srcObject.getTracks();
            for (const track of tracks) {
              if (track && track.readyState === 'live') {
                track.stop();
              }
            }
            video.srcObject = null;
          }
        } catch (err) {
          console.error("Error stopping video element:", err);
        }
      }
    } catch (err) {
      console.error("Error during video cleanup:", err);
    }
    
    // Wait for browser to release resources
    return new Promise(resolve => setTimeout(resolve, 300));
  }, []);
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      emergencyCleanup();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, [emergencyCleanup]);

  // QR code verification logic
  const verifyQRCode = useCallback(async (code) => {
    if (!code || loading || resetInProgress) return;
    
    // Using a local variable to track if this verification process should continue
    let isActive = true;
    
    // Stop camera if we're in camera mode
    if (scanMode === 'camera') {
      await emergencyCleanup();
      
      // Only continue if we're still supposed to be processing this verification
      if (!isActive) return;
      
      setScanMode(null);
    }
    
    setLoading(true);
    setError(null);
    
    // Create a new abort controller for this request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      console.log("Verifying QR code:", code);
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");

      if (!token || userData.userType !== "admin") {
        throw new Error("Admin authentication required");
      }

      const response = await axios.get(
        `${BASE_URL}/api/donor/verify-qr/${code}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: abortControllerRef.current.signal,
        }
      );

      // Check if this verification process is still active
      if (!isActive) return;

      if (response.data.status === "success") {
        setScanData(response.data.data);
        showToast("QR code verified successfully!", "success");
      } else {
        throw new Error("Failed to verify QR code");
      }
    } catch (error) {
      // Only process errors if this verification is still active
      if (!isActive) return;
      
      if (error.name !== "AbortError") {
        const errorMessage = error.response?.data?.message || error.message;
        const userFriendlyMessage = errorMessage.includes("not found")
          ? "Invalid QR code: Donor not found"
          : errorMessage.includes("authentication")
          ? "Admin login required"
          : "QR verification failed";

        setError(userFriendlyMessage);
        showToast(userFriendlyMessage, "error");
      }
    } finally {
      // Only update loading state if this verification is still active
      if (isActive) {
        setLoading(false);
      }
    }
    
    // Provide a way to cancel this verification process
    return () => {
      isActive = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loading, scanMode, emergencyCleanup, resetInProgress]);

  // Check initial camera permission
  useEffect(() => {
    const storedPermission = localStorage.getItem("cameraPermission");
    
    // Function to check if camera is actually available
    const checkCameraAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Release the stream immediately - we don't need it yet
        stream.getTracks().forEach(track => track.stop());
        
        setHasPermission(true);
        setCameraEnabled(true);
        localStorage.setItem("cameraPermission", "granted");
        return true;
      } catch (err) {
        console.error("Camera check failed:", err);
        setHasPermission(false);
        setCameraEnabled(false);
        localStorage.setItem("cameraPermission", "denied");
        return false;
      }
    };
    
    // If we have stored permission, we still need to verify camera access
    if (storedPermission === "granted") {
      checkCameraAccess();
    } else {
      setHasPermission(false);
      setCameraEnabled(false);
    }
    
    return () => {
      emergencyCleanup();
    };
  }, [emergencyCleanup]);

  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Immediately release the stream - it will be requested again when needed
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      setCameraEnabled(true);
      localStorage.setItem("cameraPermission", "granted");
    } catch (err) {
      console.error("Camera permission error:", err);
      setHasPermission(false);
      setCameraEnabled(false);
      localStorage.setItem("cameraPermission", "denied");
      setError(
        err.name === "NotAllowedError"
          ? "Camera access was denied. Please enable camera access in your browser settings."
          : "Unable to access camera. Please check your device settings."
      );
    }
  };

  // Start scanner when camera mode is active
  useEffect(() => {
    // Create a single reference to track if component is mounted
    let isComponentMounted = true;
    
    const initializeScanner = async () => {
      // Don't initialize if not in camera mode or other conditions prevent it
      if (!(scanMode === 'camera' && !scanData && !loading && !resetInProgress)) {
        return;
      }
      
      // Ensure all previous instances are properly cleaned up
      try {
        // Stop existing scanner instance
        if (html5QrCodeRef.current) {
          console.log("Stopping existing scanner before creating new one");
          await html5QrCodeRef.current.stop().catch(err => {
            console.error("Error stopping existing scanner:", err);
          });
          html5QrCodeRef.current = null;
        }
        
        // Extra cleanup for any lingering video elements
        const videoElements = document.querySelectorAll('video');
        videoElements.forEach(video => {
          try {
            if (video.srcObject) {
              const tracks = video.srcObject.getTracks();
              tracks.forEach(track => {
                if (track && track.readyState === 'live') {
                  track.stop();
                }
              });
              video.srcObject = null;
            }
          } catch (err) {
            console.error("Error stopping video element:", err);
          }
        });
        
        // Wait for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (!isComponentMounted) return;
        
        console.log("Creating new scanner instance");
        // Create scanner with defensive error handling
        try {
          // Check if element exists
          const scannerElement = document.getElementById(qrcodeRegionId);
          if (!scannerElement) {
            console.error("Scanner element not found in DOM");
            return;
          }
          
          // Create new scanner instance
          html5QrCodeRef.current = new Html5Qrcode(qrcodeRegionId);
          
          // Get camera list
          const devices = await Html5Qrcode.getCameras();
          if (!isComponentMounted) return;
          
          if (!(devices && devices.length)) {
            setError("No camera devices found on your device");
            setScanMode(null);
            return;
          }
          
          // Prefer back camera
          const cameraId = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('rear')
          )?.id || devices[0].id;
          
          if (!isComponentMounted) return;
          
          // Start the scanner with robust error handling
          await html5QrCodeRef.current.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            (qrCodeMessage) => {
              if (!isComponentMounted) return;
              
              console.log("QR Code detected:", qrCodeMessage);
              
              // Immediately stop the scanner to prevent duplicate scans
              if (html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().catch(e => 
                  console.error("Error stopping scanner after detection:", e)
                );
                html5QrCodeRef.current = null;
              }
              
              // Only process scan if we're not already in a loading or reset state
              if (isComponentMounted && !loading && !resetInProgress) {
                verifyQRCode(qrCodeMessage);
              }
            },
            // Error handler is intentionally minimal to avoid excessive logging
            () => {}
          );
          
          if (isComponentMounted) {
            showToast("Camera activated", "success");
          }
        } catch (err) {
          console.error("Error initializing scanner:", err);
          if (isComponentMounted) {
            setError(`Camera error: ${err.message || "Unknown error"}`);
            setScanMode(null);
            html5QrCodeRef.current = null;
          }
        }
      } catch (err) {
        console.error("Fatal scanner initialization error:", err);
        if (isComponentMounted) {
          setError("Failed to initialize scanner");
          setScanMode(null);
        }
      }
    };

    // Initialize scanner with a delay to avoid rapid state transitions
    const timerId = setTimeout(() => {
      if (isComponentMounted) {
        initializeScanner();
      }
    }, 300);

    // Cleanup function
    return () => {
      isComponentMounted = false;
      clearTimeout(timerId);
      
      // Always clean up scanner on unmount/dependency change
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current = null;
      }
    };
  }, [scanMode, scanData, loading, resetInProgress, verifyQRCode]);

  // Manual QR code scan function
  const startManualScan = () => {
    if (loading || resetInProgress) return;
    
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file upload for QR code scanning
  const handleFileUpload = async (event) => {
    if (loading || resetInProgress) return;
    
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      // Clean up camera resources first
      await emergencyCleanup();
      
      setLoading(true);
      setError(null);
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file containing a QR code');
      }
      
      // Read the file as Data URL to avoid blob URL CSP issues
      const imageDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      
      // Process the image using a canvas
      try {
        // Create image element to load the data URL
        const img = new Image();
        
        // Set up a promise to wait for image load
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error('Failed to load image'));
          // Set timeout to prevent hanging
          const timeout = setTimeout(() => reject(new Error('Image load timeout')), 5000);
          
          // Set the source - this is a data URL, not a blob URL
          img.src = imageDataUrl;
          
          // Clean up timeout if image loads
          img.onload = () => {
            clearTimeout(timeout);
            resolve();
          };
        });
        
        // Create canvas to draw the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        
        // Get image data for QR code detection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Use jsQR to detect QR code
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code && code.data) {
          // Successfully found QR code
          console.log("QR code detected from image:", code.data);
          verifyQRCode(code.data);
        } else {
          throw new Error("No QR code found in the image");
        }
      } catch (processingError) {
        console.error("Image processing error:", processingError);
        
        // Fallback to manual entry
        const userChoice = confirm("Could not detect QR code in the image. Would you like to enter the code manually?");
        
        if (userChoice) {
          const manualCode = prompt("Enter the QR code value:");
          if (manualCode && manualCode.trim()) {
            verifyQRCode(manualCode.trim());
          } else {
            throw new Error("No code entered");
          }
        } else {
          throw new Error("QR code detection failed");
        }
      }
    } catch (err) {
      console.error("Error processing image:", err);
      setError("Failed to process QR code: " + (err.message || "Unknown error"));
      setLoading(false);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Start camera scanning
  const startCameraScan = () => {
    if (loading || resetInProgress) return;
    setScanMode('camera');
    setScannerKey(prev => prev + 1);
  };

  // Cancel scanning and return to selection screen
  const cancelScanning = async () => {
    try {
      // Stop camera and clean up resources
      await emergencyCleanup();
      
      // Reset states to go back to selection screen
      setScanMode(null);
      setError(null);
    } catch (err) {
      console.error("Error during cancel:", err);
    }
  };

  // Reset to scan a new QR code
  const handleReset = useCallback(() => {
    if (resetInProgress || loading) return;
    
    console.log("Starting scanner reset");
    setResetInProgress(true);
    
    // Use an async function to handle the cleanup sequence
    const performReset = async () => {
      try {
        // Perform emergency cleanup first - with await to ensure it completes
        await emergencyCleanup();
        
        // Clear scanning states
        setScanData(null);
        setError(null);
        setScanMode(null);
        
        // Abort any pending requests
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = new AbortController();
        }
        
        // Clear any existing cleanup timeouts
        if (cleanupTimeoutRef.current) {
          clearTimeout(cleanupTimeoutRef.current);
        }
        
        // Add additional delay to ensure DOM is updated
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Use a timeout for UI feedback
        cleanupTimeoutRef.current = setTimeout(() => {
          setResetInProgress(false);
          showToast("Ready for new scan", "success");
        }, 1000);
      } catch (err) {
        console.error("Error during reset:", err);
        // Ensure we exit the reset state even if there was an error
        setResetInProgress(false);
        setError("Error resetting scanner. Please refresh the page.");
      }
    };
    
    // Start the reset process
    performReset();
  }, [resetInProgress, emergencyCleanup, loading]);

  // Eligibility helper functions
  const getEligibilityStatus = (lastDonation) => {
    if (!lastDonation) return true;
    const lastDonationDate = new Date(lastDonation);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return lastDonationDate <= threeMonthsAgo;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const showToast = (message, type) => {
    const toast = { show: true, message, type };
    setToast(toast);
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Camera permission UI
  if (!hasPermission || !cameraEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-lg p-8 text-center">
          <Camera className="w-16 h-16 mx-auto mb-4 text-dark_red" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Camera Access Required
          </h2>
          <p className="text-gray-600 mb-6">
            To scan donor QR codes, we need permission to use your camera.
          </p>
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}
          <button
            onClick={requestCameraPermission}
            className="w-full bg-dark_red hover:bg-red-800 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
          >
            Enable Camera
          </button>
        </div>
      </div>
    );
  }

  // Main scanner UI
  return (
    <>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      
      {/* Hidden file input for QR image upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-dark_red mb-8 text-center">
              Scan Donor QR Code
            </h1>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                {/* Scan Options */}
                {!scanData && !loading && !resetInProgress && !scanMode && (
                  <div className="flex flex-col items-center justify-center space-y-8 p-6">
                    <div className="w-40 h-40 bg-dark_red/10 rounded-full flex items-center justify-center">
                      <Scan className="w-20 h-20 text-dark_red" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Choose a scanning method
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                      <button
                        onClick={startCameraScan}
                        className="flex-1 bg-dark_red hover:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                      >
                        <Camera className="w-5 h-5" />
                        <span>Use Camera</span>
                      </button>
                      <button
                        onClick={startManualScan}
                        className="flex-1 border border-dark_red text-dark_red hover:bg-dark_red/5 font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                      >
                        <Upload className="w-5 h-5" />
                        <span>Upload QR Image</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Camera Scanner */}
                {scanMode === 'camera' && !scanData && !resetInProgress && (
                  <div className="flex flex-col items-center">
                    <div className="relative max-w-sm w-full mx-auto mb-4">
                      <div 
                        className="aspect-square overflow-hidden rounded-lg border-2 border-dark_red"
                        style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                      >
                        <div 
                          id={qrcodeRegionId} 
                          className="w-full h-full"
                          style={{ position: "relative" }}
                        >
                          {/* Scanner will be inserted here by the library */}
                          
                          {/* Camera overlay with crosshair */}
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                            <div className="w-48 h-48 border-2 border-white border-opacity-80 rounded-lg shadow-lg">
                              <div className="absolute inset-0 border-8 border-transparent">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-gray-600 text-sm mt-3 font-medium">
                        Position QR code in the center of the frame
                      </p>
                    </div>
                    
                    <button
                      onClick={cancelScanning}
                      className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Loading indicator */}
                {(loading || resetInProgress) && (
                  <div className="flex flex-col items-center justify-center p-6">
                    <Loader2 className="w-10 h-10 text-dark_red animate-spin mb-3" />
                    <p className="text-gray-600 text-sm">
                      {resetInProgress
                        ? "Resetting scanner..."
                        : loading
                        ? "Processing QR code..."
                        : "Initializing..."}
                    </p>
                  </div>
                )}

                {/* Error display */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-700 rounded-md">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                      <p className="font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {/* Scan result display */}
                {scanData && !resetInProgress && (
                  <div className="mt-6 animate-fade-in">
                    {/* Donor info display */}
                    <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-dark_red rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {scanData.name || "N/A"}
                        </h2>
                        <p className="text-gray-600">
                          ID: {scanData.donorId || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Medical Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplet className="w-5 h-5 text-dark_red" />
                          <h3 className="font-semibold">Blood Type</h3>
                        </div>
                        <p className="text-2xl font-bold text-dark_red">
                          {scanData.bloodType || "N/A"}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-5 h-5 text-dark_red" />
                          <h3 className="font-semibold">Age</h3>
                        </div>
                        <p className="text-2xl font-bold">
                          {scanData.age || "N/A"} years
                        </p>
                      </div>
                    </div>

                    {/* Eligibility Status */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-4">
                        {getEligibilityStatus(scanData.lastDonation) ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                        <h3 className="font-semibold">Donation Eligibility</h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <p className="text-gray-600">
                          {scanData.lastDonation ? (
                            <>
                              Last Donation: {formatDate(scanData.lastDonation)}
                              <br />
                              {!getEligibilityStatus(scanData.lastDonation) && (
                                <span className="text-red-500">
                                  Next eligible donation date:{" "}
                                  {formatDate(
                                    new Date(
                                      new Date(scanData.lastDonation).setMonth(
                                        new Date(
                                          scanData.lastDonation
                                        ).getMonth() + 3
                                      )
                                    )
                                  )}
                                </span>
                              )}
                            </>
                          ) : (
                            "No previous donations"
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Donation History */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold mb-4">Recent Donations</h3>
                      {scanData.donationHistory?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-center">
                                  Blood Type
                                </th>
                                <th className="px-4 py-2 text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {scanData.donationHistory.map(
                                (donation, index) => (
                                  <tr
                                    key={index}
                                    className="border-b border-gray-200 last:border-0"
                                  >
                                    <td className="px-4 py-2">
                                      {formatDate(donation.date)}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                      {donation.bloodType}
                                    </td>
                                    <td className="px-4 py-2 text-right text-dark_red font-medium">
                                      {donation.units} ml
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No donation history available
                        </p>
                      )}
                    </div>

                    {/* Scan New QR Code button */}
                    <div className="mt-6 text-center">
                      <button
                        onClick={handleReset}
                        disabled={loading || resetInProgress}
                        className={`${
                          loading || resetInProgress
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-dark_red hover:bg-red-800"
                        } text-white font-bold py-2.5 px-8 rounded-lg transition duration-200 flex items-center justify-center mx-auto gap-2`}
                      >
                        {loading || resetInProgress ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                        <Camera className="w-4 h-4" />
                        )}
                        {loading || resetInProgress
                          ? "Resetting..."
                          : "Scan New QR Code"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <footer className="mt-8 border-t border-gray-100 pt-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                    <span className="text-sm">System Online</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200" />
                  <div className="flex items-center text-gray-500">
                    <div className={`w-2 h-2 ${scanMode === 'camera' ? "bg-dark_red" : "bg-gray-400"} rounded-full mr-2 animate-pulse`} />
                    <span className="text-sm">Camera {scanMode === 'camera' ? "Active" : "Ready"}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  Powered by{" "}
                  <span className="font-bold text-dark mx-2">
                    Mota<span className="text-red">bari3</span>
                  </span>{" "}
                  Blood <span className="mx-1">Donation System</span>
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}

export default QRScannerPage;

