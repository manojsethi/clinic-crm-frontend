import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, message, Typography, Card, Tag, Spin, Input } from 'antd';
import { LinkOutlined, QrcodeOutlined, DownloadOutlined } from '@ant-design/icons';
import { fileManagerService } from '../services/api';
import type { FileItem } from '../types';

const { Text } = Typography;

interface QRScannerProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({ visible, onClose, title = "QR Code Scanner" }) => {
  const [scanning, setScanning] = useState(false);
  const [scannedFile, setScannedFile] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (visible) {
      startScanning();
    } else {
      stopScanning();
      setScannedFile(null);
    }
  }, [visible]);

  const startScanning = async () => {
    try {
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera if available
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      message.error('Unable to access camera. Please check permissions.');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const handleScan = async (fileId: string) => {
    try {
      setLoading(true);
      const response = await fileManagerService.accessFileByQR(fileId);
      
      if (response.success && response.file) {
        setScannedFile(response.file);
        
        // If it's a URL type file, automatically redirect
        if (response.file.type === 'url' && response.file.url) {
          message.success(`Redirecting to: ${response.file.name}`);
          setTimeout(() => {
            window.open(response.file.url, '_blank');
          }, 1000);
        } else {
          message.success(`File found: ${response.file.name}`);
        }
      } else {
        message.error(response.message || 'File not found');
      }
    } catch (error) {
      console.error('Error accessing file:', error);
      message.error('Failed to access file');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    stopScanning();
    setScannedFile(null);
    setManualInput('');
    onClose();
  };

  const handleScanAgain = () => {
    setScannedFile(null);
    setManualInput('');
    setLoading(false);
  };

  const handleManualScan = () => {
    if (manualInput.trim()) {
      handleScan(manualInput.trim());
    } else {
      message.error('Please enter a file ID');
    }
  };

  const handleOpenUrl = () => {
    if (scannedFile?.url) {
      window.open(scannedFile.url, '_blank');
    }
  };

  const handleDownload = async () => {
    if (!scannedFile) return;
    
    try {
      setDownloading(true);
      const blob = await fileManagerService.downloadFile(scannedFile._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = scannedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success('File downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      message.error('Failed to download file');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button key="close" onClick={handleClose}>
          Close
        </Button>,
        scannedFile && scannedFile.type === 'url' && (
          <Button key="open" type="primary" onClick={handleOpenUrl} icon={<LinkOutlined />}>
            Open URL
          </Button>
        ),
        scannedFile && scannedFile.type !== 'url' && (
          <Button 
            key="download" 
            type="primary" 
            onClick={handleDownload} 
            icon={<DownloadOutlined />}
            loading={downloading}
          >
            Download File
          </Button>
        ),
        scannedFile && (
          <Button key="scan-again" onClick={handleScanAgain}>
            Scan Again
          </Button>
        ),
      ]}
      width={600}
    >
      <div className="text-center">
        {!scannedFile ? (
          <div>
            <div className="mb-4">
              <Text>Position the QR code within the camera view</Text>
            </div>
            
            <div className="relative mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md mx-auto border rounded"
                style={{ maxHeight: '300px' }}
              />
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
                  <div className="text-center text-white">
                    <Spin size="large" />
                    <div className="mt-2">Scanning...</div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500 mb-4">
              <Text type="secondary">
                Note: This is a demo scanner. In a real implementation, you would integrate with a QR code scanning library like 'qr-scanner' or 'quagga2'.
              </Text>
            </div>

            {/* Manual input for testing */}
            <div className="mt-4">
              <div className="mb-2">
                <Text strong>Manual Input (for testing):</Text>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter file ID to test..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onPressEnter={handleManualScan}
                />
                <Button 
                  type="primary"
                  icon={<QrcodeOutlined />}
                  onClick={handleManualScan}
                  loading={loading}
                >
                  Scan
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <Text strong className="text-lg">
                {scannedFile.name}
              </Text>
              <br />
              <Text type="secondary">{scannedFile.description}</Text>
            </div>

            <Card className="mb-4">
              <div className="text-left">
                <div className="mb-2">
                  <Text strong>Type:</Text>{" "}
                  <Tag color={scannedFile.type === 'url' ? 'green' : scannedFile.type === 'image' ? 'blue' : 'orange'}>
                    {scannedFile.type.toUpperCase()}
                  </Tag>
                </div>
                
                {scannedFile.type === 'url' && scannedFile.url && (
                  <div className="mb-2">
                    <Text strong>URL:</Text>{" "}
                    <Text code className="break-all">{scannedFile.url}</Text>
                  </div>
                )}
                
                {scannedFile.size && (
                  <div className="mb-2">
                    <Text strong>Size:</Text>{" "}
                    {(scannedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                )}
                
                <div className="mb-2">
                  <Text strong>Created:</Text>{" "}
                  {new Date(scannedFile.createdAt).toLocaleString()}
                </div>
                
                {scannedFile.tags && scannedFile.tags.length > 0 && (
                  <div>
                    <Text strong>Tags:</Text>
                    <div className="mt-1">
                      {scannedFile.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {scannedFile.type === 'url' ? (
              <div className="text-center">
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<LinkOutlined />}
                  onClick={handleOpenUrl}
                >
                  Open URL in New Tab
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                  loading={downloading}
                >
                  Download File
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
