class CameraService {
  constructor() {
    this.stream = null;
    this.constraints = {
      video: {
        width: { ideal: 1920, max: 1920 },
        height: { ideal: 1080, max: 1080 },
        facingMode: 'environment', // Use back camera on mobile
        aspectRatio: { ideal: 4/3 }
      },
      audio: false
    };
  }

  async startCamera() {
    try {
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      // Request camera permission and start stream
      this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
      return this.stream;
    } catch (error) {
      console.error('Camera access error:', error);
      
      // Try with less restrictive constraints if the initial request fails
      if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
        try {
          const fallbackConstraints = {
            video: {
              facingMode: 'environment'
            },
            audio: false
          };
          
          this.stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
          return this.stream;
        } catch (fallbackError) {
          console.error('Fallback camera access failed:', fallbackError);
          throw new Error('Unable to access camera. Please check permissions.');
        }
      }
      
      // Handle specific error types
      switch (error.name) {
        case 'NotAllowedError':
          throw new Error('Camera permission denied. Please allow camera access and try again.');
        case 'NotFoundError':
          throw new Error('No camera found on this device.');
        case 'NotReadableError':
          throw new Error('Camera is already in use by another application.');
        case 'SecurityError':
          throw new Error('Camera access blocked due to security restrictions.');
        default:
          throw new Error('Failed to access camera. Please try again.');
      }
    }
  }

  async capturePhoto(videoElement, canvasElement) {
    if (!videoElement || !canvasElement) {
      throw new Error('Video or canvas element not provided');
    }

    if (!this.stream) {
      throw new Error('Camera not started');
    }

    try {
      // Get video dimensions
      const videoWidth = videoElement.videoWidth;
      const videoHeight = videoElement.videoHeight;
      
      if (videoWidth === 0 || videoHeight === 0) {
        throw new Error('Video not ready for capture');
      }

      // Set canvas dimensions to match video
      canvasElement.width = videoWidth;
      canvasElement.height = videoHeight;

      // Draw video frame to canvas
      const context = canvasElement.getContext('2d');
      context.drawImage(videoElement, 0, 0, videoWidth, videoHeight);

      // Convert canvas to blob
      return new Promise((resolve, reject) => {
        canvasElement.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create image blob'));
            }
          },
          'image/jpeg',
          0.8 // Quality setting (0.8 = 80% quality)
        );
      });
    } catch (error) {
      console.error('Photo capture error:', error);
      throw new Error('Failed to capture photo. Please try again.');
    }
  }

  stopCamera(videoElement = null) {
    try {
      // Stop all tracks in the stream
      if (this.stream) {
        this.stream.getTracks().forEach(track => {
          track.stop();
        });
        this.stream = null;
      }

      // Clear video element source
      if (videoElement) {
        videoElement.srcObject = null;
      }
    } catch (error) {
      console.error('Error stopping camera:', error);
    }
  }

  async getAvailableCameras() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return [];
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error getting available cameras:', error);
      return [];
    }
  }

  async switchCamera(deviceId) {
    try {
      // Stop current stream
      this.stopCamera();

      // Update constraints with specific device
      const newConstraints = {
        ...this.constraints,
        video: {
          ...this.constraints.video,
          deviceId: { exact: deviceId }
        }
      };

      // Start new stream with selected camera
      this.stream = await navigator.mediaDevices.getUserMedia(newConstraints);
      return this.stream;
    } catch (error) {
      console.error('Camera switch error:', error);
      throw new Error('Failed to switch camera');
    }
  }

  // Utility method to compress image if needed
  async compressImage(blob, maxSizeKB = 500) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions to keep aspect ratio
        const maxDimension = 1200; // Max width or height
        let { width, height } = img;
        
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try different quality levels to meet size requirement
        let quality = 0.8;
        const tryCompress = () => {
          canvas.toBlob(
            (compressedBlob) => {
              const sizeKB = compressedBlob.size / 1024;
              
              if (sizeKB <= maxSizeKB || quality <= 0.1) {
                resolve(compressedBlob);
              } else {
                quality -= 0.1;
                tryCompress();
              }
            },
            'image/jpeg',
            quality
          );
        };
        
        tryCompress();
      };

      img.src = URL.createObjectURL(blob);
    });
  }

  // Check if camera is supported
  static isSupported() {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.HTMLCanvasElement &&
      HTMLCanvasElement.prototype.toBlob
    );
  }

  // Request camera permissions
  static async requestPermissions() {
    try {
      if (!this.isSupported()) {
        throw new Error('Camera not supported');
      }

      // Request minimal permissions first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      // Stop the stream immediately - we just wanted to check permissions
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }
}

export const cameraService = new CameraService();
