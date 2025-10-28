import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Result, Button, Typography, Card, Tag, message, Image } from 'antd';
import { LinkOutlined, FileOutlined, PictureOutlined, HomeOutlined, DownloadOutlined } from '@ant-design/icons';
import { fileManagerService } from '../services/api';
import type { FileItem } from '../types';

const { Title, Text } = Typography;

export const QRHandler: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<FileItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (fileId) {
      handleFileAccess(fileId);
    } else {
      setError('Invalid QR code');
      setLoading(false);
    }

    // Cleanup image URL on unmount
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [fileId, imageUrl]);

  const handleFileAccess = async (id: string) => {
    try {
      setLoading(true);
      const response = await fileManagerService.accessFileByQR(id);
      
      if (response.success && response.file) {
        setFile(response.file);
        
        // If it's an image file, get the image URL
        if (response.file.type === 'image') {
          try {
            const imageBlob = await fileManagerService.downloadFile(id);
            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);
          } catch (imageError) {
            console.error('Error loading image:', imageError);
            message.warning('Could not load image preview');
          }
        }
        
        // If it's a URL type file, automatically redirect after a short delay
        if (response.file.type === 'url' && response.file.url) {
          message.success(`Redirecting to: ${response.file.name}`);
          setTimeout(() => {
            window.open(response.file.url, '_blank');
          }, 2000); // 2 second delay to show the file info
        }
      } else {
        setError(response.message || 'File not found');
      }
    } catch (error) {
      console.error('Error accessing file:', error);
      setError('Failed to access file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUrl = () => {
    if (file?.url) {
      window.open(file.url, '_blank');
    }
  };

  const handleDownload = async () => {
    if (!file) return;
    
    try {
      setDownloading(true);
      const blob = await fileManagerService.downloadFile(file._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
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

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4">
            <Text>Loading file information...</Text>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Result
          status="error"
          title="File Not Found"
          subTitle={error}
          extra={[
            <Button type="primary" key="home" icon={<HomeOutlined />} onClick={handleGoHome}>
              Go to Home
            </Button>,
          ]}
        />
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Result
          status="404"
          title="File Not Found"
          subTitle="The requested file could not be found."
          extra={[
            <Button type="primary" key="home" icon={<HomeOutlined />} onClick={handleGoHome}>
              Go to Home
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-lg">
          <div className="text-center">
            <div className="mb-6">
              {/* Show image if it's an image file */}
              {file.type === 'image' && imageUrl ? (
                <div className="mb-4">
                  <Image
                    src={imageUrl}
                    alt={file.name}
                    className="max-w-full h-auto rounded-lg shadow-lg"
                    style={{ maxHeight: '400px' }}
                    preview={{
                      mask: 'Click to preview',
                    }}
                  />
                </div>
              ) : (
                <div className="text-6xl mb-4">
                  {file.type === 'image' ? (
                    <PictureOutlined className="text-blue-500" />
                  ) : file.type === 'url' ? (
                    <LinkOutlined className="text-green-500" />
                  ) : (
                    <FileOutlined className="text-orange-500" />
                  )}
                </div>
              )}
              
              <Title level={2} className="mb-2">
                {file.name}
              </Title>
              <Text type="secondary" className="text-lg">
                {file.description || 'No description available'}
              </Text>
              {file.type === 'url' && (
                <div className="mt-2">
                  <Text type="success" className="text-sm">
                    🔗 This file contains a URL and will redirect automatically
                  </Text>
                </div>
              )}
              {file.type === 'image' && (
                <div className="mt-2">
                  <Text type="success" className="text-sm">
                    🖼️ Image preview loaded - click to view full size
                  </Text>
                </div>
              )}
            </div>

            <div className="mb-6">
              <Tag 
                color={file.type === 'url' ? 'green' : file.type === 'image' ? 'blue' : 'orange'}
                className="text-lg px-4 py-2"
              >
                {file.type.toUpperCase()}
              </Tag>
            </div>

            {file.type === 'url' && file.url && (
              <div className="mb-6">
                <Card className="bg-green-50 border-green-200">
                  <div className="text-left">
                    <Text strong className="text-lg">URL:</Text>
                    <div className="mt-2">
                      <Text code className="break-all text-sm">
                        {file.url}
                      </Text>
                    </div>
                    <div className="mt-4">
                      <Button 
                        type="primary" 
                        size="large" 
                        icon={<LinkOutlined />}
                        onClick={handleOpenUrl}
                        className="w-full"
                      >
                        Open URL in New Tab
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            <div className="text-left mb-6">
              <Title level={4}>File Details</Title>
              <div className="space-y-2">
                {file.size && (
                  <div>
                    <Text strong>Size:</Text>{" "}
                    <Text>{(file.size / 1024 / 1024).toFixed(2)} MB</Text>
                  </div>
                )}
                <div>
                  <Text strong>Created:</Text>{" "}
                  <Text>{new Date(file.createdAt).toLocaleString()}</Text>
                </div>
                {file.tags && file.tags.length > 0 && (
                  <div>
                    <Text strong>Tags:</Text>
                    <div className="mt-1">
                      {file.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                type="default" 
                icon={<HomeOutlined />} 
                onClick={handleGoHome}
              >
                Go to Home
              </Button>
              {file.type === 'url' && (
                <Button 
                  type="primary" 
                  icon={<LinkOutlined />} 
                  onClick={handleOpenUrl}
                >
                  Open URL
                </Button>
              )}
              {(file.type === 'file' || file.type === 'image') && (
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />} 
                  onClick={handleDownload}
                  loading={downloading}
                >
                  Download File
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
