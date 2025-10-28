import React, { useState, useEffect } from "react";
import {
    Card,
    Button,
    Upload,
    Input,
    Form,
    Select,
    Table,
    Tag,
    Space,
    Modal,
    message,
    Typography,
    Tabs,
    Tooltip,
    Popconfirm,
    Divider,
    Radio,
    Steps,
} from "antd";
import {
    UploadOutlined,
    LinkOutlined,
    FileOutlined,
    PictureOutlined,
    QrcodeOutlined,
    DeleteOutlined,
    EyeOutlined,
    DownloadOutlined,
    PlusOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { QRCodeSVG } from "qrcode.react";
import type { UploadProps } from "antd";
import type { FileItem } from "../types";
import { fileManagerService } from "../services/api";
import useApp from "antd/es/app/useApp";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

const FileManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState("upload");
    const [uploadForm] = Form.useForm();
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [selectedFileForQR, setSelectedFileForQR] = useState<FileItem | null>(null);
    const [searchText, setSearchText] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [uploadType, setUploadType] = useState<"file" | "image" | "url">(
        "file"
    );
    const [currentStep, setCurrentStep] = useState(0);
    const [uploadedFile, setUploadedFile] = useState<FileItem | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { notification } = useApp()

    // Load files from API
    const loadFiles = async () => {
        try {
            setLoading(true);
            const response = await fileManagerService.getFiles({
                type: filterType === "all" ? undefined : filterType,
                search: searchText || undefined,
            });
            setFiles(response.files);
        } catch (error: any) {
            console.error("Failed to load files:", error);
            const errorMessage = error?.response?.data?.message || "Failed to load files";
            notification.error({ message: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFiles();
    }, [filterType, searchText]);

    const handleUpload = async (values: any) => {
        try {
            setLoading(true);

            if (uploadType === "url") {
                const response = await fileManagerService.createUrlFile({
                    name: values.name,
                    url: values.url,
                    description: values.description,
                    tags: values.tags || [],
                });

                if (response.success && response.file) {
                    setUploadedFile(response.file);
                    setFiles((prev) => [response.file!, ...prev]);
                    setCurrentStep(2);
                    message.success("URL added successfully!");
                } else {
                    message.error(response.message || "Failed to add URL");
                }
            }
        } catch (error) {
            console.error("Upload error:", error);
            message.error(`Failed to upload ${uploadType}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        return false; // Prevent auto upload
    };

    const handleUploadFile = async () => {
        if (!selectedFile) {
            message.error("Please select a file first");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("name", selectedFile.name);
            formData.append("description", uploadForm.getFieldValue("description") || "");
            formData.append("tags", JSON.stringify(uploadForm.getFieldValue("tags") || []));

            const response = await fileManagerService.uploadFile(formData);

            if (response.success && response.file) {
                setUploadedFile(response.file);
                setFiles((prev) => [response.file!, ...prev]);
                setCurrentStep(2); // Go to scanner step
                setSelectedFile(null); // Clear selected file
                message.success("File uploaded successfully!");
            } else {
                message.error(response.message || "Failed to upload file");
            }
        } catch (error) {
            console.error("File upload error:", error);
            message.error("Failed to upload file");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateQR = (file: FileItem) => {
        setSelectedFileForQR(file);
        setQrModalVisible(true);
    };

    const handleResetUpload = () => {
        setCurrentStep(0);
        setUploadedFile(null);
        setSelectedFile(null);
        uploadForm.resetFields();
        setUploadType("file");
    };

    const handleDeleteFile = async (fileId: string) => {
        try {
            const response = await fileManagerService.deleteFile(fileId);
            if (response.success) {
                setFiles((prev) => prev.filter((file) => file._id !== fileId));
                message.success("File deleted successfully!");
            } else {
                message.error(response.message || "Failed to delete file");
            }
        } catch (error: any) {
            console.error("Delete error:", error);
            const errorMessage = error?.response?.data?.message || "Failed to delete file";
            message.error(errorMessage);
        }
    };

    // Files are already filtered by the API, so we can use them directly
    const filteredFiles = files;

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (text: string, record: FileItem) => (
                <Space>
                    {record.type === "image" ? (
                        <PictureOutlined />
                    ) : record.type === "url" ? (
                        <LinkOutlined />
                    ) : (
                        <FileOutlined />
                    )}
                    <Text strong>{text}</Text>
                </Space>
            ),
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (type: string) => (
                <Tag
                    color={
                        type === "image" ? "blue" : type === "url" ? "green" : "orange"
                    }
                >
                    {type.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: "Size",
            dataIndex: "size",
            key: "size",
            render: (size: number) =>
                size ? `${(size / 1024 / 1024).toFixed(2)} MB` : "-",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },

        {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: FileItem) => (
                <Space>
                    <Tooltip title="Generate QR Code">
                        <Button
                            type="primary"
                            icon={<QrcodeOutlined />}
                            size="small"
                            onClick={() => handleGenerateQR(record)}
                        />
                    </Tooltip>
                  {record.type==="url"&&  <Tooltip title="View">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => {
                                if (record.type === "url") {
                                    window.open(record.url, "_blank");
                                } else {
                                    message.info("File preview not implemented yet");
                                }
                            }}
                        />
                    </Tooltip>}
                    {record.type !== "url" && <Tooltip title="Download">
                        <Button
                            icon={<DownloadOutlined />}
                            size="small"
                            onClick={async () => {
                                try {
                                    const blob = await fileManagerService.downloadFile(record._id);
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = record.name;
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                } catch (error: any) {
                                    const errorMessage = error?.response?.data?.message || "Failed to download file";
                                    message.error(errorMessage);
                                }
                            }}
                        />
                    </Tooltip>}
                    <Popconfirm
                        title="Are you sure you want to delete this file?"
                        onConfirm={() => handleDeleteFile(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete">
                            <Button danger icon={<DeleteOutlined />} size="small" />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const uploadProps: UploadProps = {
        name: "file",
        multiple: false,
        beforeUpload: handleFileSelect,
        showUploadList: true,
        accept: "*/*",
        fileList: selectedFile ? [{
            uid: '1',
            name: selectedFile.name,
            status: 'done',
            url: '',
        }] : [],
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Title level={2} className="mb-2">
                    File Manager
                </Title>
                <Text type="secondary">
                    Upload files, images, or URLs and generate QR codes for easy access
                </Text>
            </div>

            <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-6">
                <TabPane tab="Upload & Generate Scanner" key="upload">
                    <div className="mx-auto">
                        <Card className="shadow-lg">
                            <Steps
                                current={currentStep}
                                items={[
                                    {
                                        title: "Choose Upload Type",
                                        description: "Select file, image, or URL",
                                    },
                                    {
                                        title: "Upload Content",
                                        description: uploadType === "url" ? "Add URL details" : "Select file and upload",
                                    },
                                    {
                                        title: "Scanner Ready",
                                        description: "QR code generated for file access",
                                    },
                                ]}
                                className="mb-8"
                            />

                            {currentStep === 0 && (
                                <div className="text-center">
                                    <Title level={3} className="!mb-8 !mt-4">
                                        Choose Upload Type
                                    </Title>

                                    <div className=" mx-auto">
                                        <Radio.Group
                                            value={uploadType}
                                            onChange={(e) => setUploadType(e.target.value)}
                                            className="w-full"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <Radio.Button
                                                    value="file"
                                                    className="!h-24 !flex !items-center justify-center border-2 hover:border-blue-400 transition-colors"
                                                    style={{
                                                        borderColor:
                                                            uploadType === "file" ? "#1890ff" : "#d9d9d9",
                                                        backgroundColor:
                                                            uploadType === "file" ? "#f0f8ff" : "#fff",
                                                    }}
                                                >
                                                    <div className="text-center">
                                                        <FileOutlined
                                                            className="text-3xl mb-2 block"
                                                            style={{
                                                                color:
                                                                    uploadType === "file" ? "#1890ff" : "#666",
                                                            }}
                                                        />
                                                        <div className="font-semibold text-sm">
                                                            Upload File
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Documents, PDFs
                                                        </div>
                                                    </div>
                                                </Radio.Button>

                                                <Radio.Button
                                                    value="image"
                                                    className="!h-24 !flex !items-center justify-center border-2 hover:border-blue-400 transition-colors"
                                                    style={{
                                                        borderColor:
                                                            uploadType === "image" ? "#1890ff" : "#d9d9d9",
                                                        backgroundColor:
                                                            uploadType === "image" ? "#f0f8ff" : "#fff",
                                                    }}
                                                >
                                                    <div className="text-center">
                                                        <PictureOutlined
                                                            className="text-3xl mb-2 block"
                                                            style={{
                                                                color:
                                                                    uploadType === "image" ? "#1890ff" : "#666",
                                                            }}
                                                        />
                                                        <div className="font-semibold text-sm">
                                                            Upload Image
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Photos, scans
                                                        </div>
                                                    </div>
                                                </Radio.Button>

                                                <Radio.Button
                                                    value="url"
                                                    className="!h-24 !flex !items-center justify-center border-2 hover:border-blue-400 transition-colors"
                                                    style={{
                                                        borderColor:
                                                            uploadType === "url" ? "#1890ff" : "#d9d9d9",
                                                        backgroundColor:
                                                            uploadType === "url" ? "#f0f8ff" : "#fff",
                                                    }}
                                                >
                                                    <div className="text-center">
                                                        <LinkOutlined
                                                            className="text-3xl mb-2 block"
                                                            style={{
                                                                color:
                                                                    uploadType === "url" ? "#1890ff" : "#666",
                                                            }}
                                                        />
                                                        <div className="font-semibold text-sm">Add URL</div>
                                                        <div className="text-xs text-gray-500">
                                                            External links
                                                        </div>
                                                    </div>
                                                </Radio.Button>
                                            </div>
                                        </Radio.Group>
                                    </div>
                                    <br />
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={() => setCurrentStep(1)}
                                        className="mt-8 px-8"
                                    >
                                        Continue
                                    </Button>
                                </div>
                            )}

                            {currentStep === 1 && (
                                <div>
                                    <Title level={3} className="!my-6">
                                        {uploadType === "url"
                                            ? "Add URL"
                                            : `Upload ${uploadType === "image" ? "Image" : "File"}`}
                                    </Title>

                                    {uploadType === "url" ? (
                                        <Form
                                            form={uploadForm}
                                            layout="vertical"
                                            onFinish={handleUpload}
                                        >
                                            <Form.Item
                                                name="name"
                                                label="Name"
                                                rules={[
                                                    { required: true, message: "Please enter a name" },
                                                ]}
                                            >
                                                <Input
                                                    prefix={<FileOutlined />}
                                                    placeholder="Enter file name"
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="url"
                                                label="URL"
                                                rules={[
                                                    { required: true, message: "Please enter a URL" },
                                                    {
                                                        type: "url",
                                                        message: "Please enter a valid URL",
                                                    },
                                                ]}
                                            >
                                                <Input
                                                    prefix={<LinkOutlined />}
                                                    placeholder="https://example.com"
                                                />
                                            </Form.Item>

                                            <Form.Item name="description" label="Description (Optional)">
                                                <TextArea
                                                    rows={3}
                                                    placeholder="Enter description (optional)"
                                                />
                                            </Form.Item>

                                            <Form.Item>
                                                <Space>
                                                    <Button onClick={() => setCurrentStep(0)}>Back</Button>
                                                    <Button
                                                        type="primary"
                                                        htmlType="submit"
                                                        loading={loading}
                                                        icon={<PlusOutlined />}
                                                    >
                                                        Add URL
                                                    </Button>
                                                </Space>
                                            </Form.Item>
                                        </Form>
                                    ) : (
                                        <div>
                                            <Form form={uploadForm} layout="vertical">
                                                <Form.Item>
                                                    <Upload.Dragger {...uploadProps} className="mb-4">
                                                        <p className="ant-upload-drag-icon">
                                                            {uploadType === "image" ? (
                                                                <PictureOutlined />
                                                            ) : (
                                                                <UploadOutlined />
                                                            )}
                                                        </p>
                                                        <p className="ant-upload-text">
                                                            Click or drag{" "}
                                                            {uploadType === "image" ? "image" : "file"} to this
                                                            area to select
                                                        </p>
                                                        <p className="ant-upload-hint">
                                                            {uploadType === "image"
                                                                ? "Support for single image upload. JPG, PNG, GIF are supported."
                                                                : "Support for single file upload. All file types are supported."}
                                                        </p>
                                                    </Upload.Dragger>
                                                </Form.Item>

                                                <Form.Item name="description" label="Description (Optional)">
                                                    <TextArea
                                                        rows={3}
                                                        placeholder="Enter description (optional)"
                                                    />
                                                </Form.Item>
                                            </Form>

                                            <div className="text-center mt-6">
                                                <Space>
                                                    <Button onClick={() => setCurrentStep(0)}>Back</Button>
                                                    <Button
                                                        type="primary"
                                                        onClick={handleUploadFile}
                                                        loading={loading}
                                                        disabled={!selectedFile}
                                                        icon={<UploadOutlined />}
                                                    >
                                                        Upload & Generate Scanner
                                                    </Button>
                                                </Space>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {currentStep === 2 && uploadedFile && (
                                <div className="text-center">
                                    <Title level={3} className="mb-6">
                                        Scanner Generated
                                    </Title>

                                    <div className="mb-6">
                                        <Text strong className="text-lg">
                                            {uploadedFile.name}
                                        </Text>
                                        <br />
                                        <Text type="secondary">{uploadedFile.description}</Text>
                                    </div>

                                    <div className="flex justify-center mb-6">
                                        <QRCodeSVG
                                            value={`${window.location.origin}/qr/${uploadedFile._id}`}
                                            size={200}
                                            level="M"
                                        />
                                    </div>

                                    <div className="text-center mb-4">
                                        <Text type="secondary">QR URL: </Text>
                                        <Text code copyable>{`${window.location.origin}/qr/${uploadedFile._id}`}</Text>
                                    </div>


                                    <div className="text-left  mx-auto mb-6">
                                        <Text strong>File Details:</Text>
                                        <div className="mt-2 space-y-1">
                                            <div>
                                                <Text strong>Type:</Text>{" "}
                                                <Tag>{uploadedFile.type.toUpperCase()}</Tag>
                                            </div>
                                            {uploadedFile.size && (
                                                <div>
                                                    <Text strong>Size:</Text>{" "}
                                                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </div>
                                            )}
                                            {uploadedFile.url && (
                                                <div>
                                                    <Text strong>URL:</Text>{" "}
                                                    <Text code>{uploadedFile.url}</Text>
                                                </div>
                                            )}
                                            <div>
                                                <Text strong>Created:</Text>{" "}
                                                {new Date(uploadedFile.createdAt).toLocaleString()}
                                            </div>
                                            {uploadedFile.tags && uploadedFile.tags.length > 0 && (
                                                <div>
                                                    <Text strong>Tags:</Text>
                                                    <div className="mt-1">
                                                        {uploadedFile.tags.map((tag) => (
                                                            <Tag key={tag}>{tag}</Tag>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Space>
                                        <Button onClick={handleResetUpload}>Upload Another</Button>
                                        <Button
                                            type="primary"
                                            icon={<QrcodeOutlined />}
                                            onClick={() => handleGenerateQR(uploadedFile)}
                                        >
                                            View Scanner Details
                                        </Button>
                                    </Space>
                                </div>
                            )}
                        </Card>
                    </div>
                </TabPane>

                <TabPane tab="Manage Files" key="manage">
                    <Card>
                        <div className="mb-4 flex flex-col sm:flex-row gap-4">
                            <Input
                                placeholder="Search files..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="flex-1"
                            />
                            <Select
                                value={filterType}
                                onChange={setFilterType}
                                style={{ width: 150 }}
                            >
                                <Option value="all">All Types</Option>
                                <Option value="file">Files</Option>
                                <Option value="image">Images</Option>
                                <Option value="url">URLs</Option>
                            </Select>

                        </div>

                        <Table
                            columns={columns}
                            dataSource={filteredFiles}
                            rowKey="_id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} of ${total} files`,
                            }}
                        />
                    </Card>
                </TabPane>
            </Tabs>

            <Modal
                title="QR Code Scanner"
                open={qrModalVisible}
                onCancel={() => setQrModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setQrModalVisible(false)}>
                        Close
                    </Button>,
                ]}
                width={500}
            >
                {selectedFileForQR && (
                    <div className="text-center">
                        <div className="mb-4">
                            <Text strong className="text-lg">
                                {selectedFileForQR.name}
                            </Text>
                            <br />
                            <Text type="secondary">{selectedFileForQR.description}</Text>
                        </div>

                        <div className="flex justify-center mb-4">
                            <QRCodeSVG
                                value={`${window.location.origin}/qr/${selectedFileForQR._id}`}
                                size={200}
                                level="M"
                            />
                        </div>

                        <div className="text-center mb-4">
                            <Text type="secondary">QR URL: </Text>
                            <Text code copyable>{`${window.location.origin}/qr/${selectedFileForQR._id}`}</Text>
                        </div>


                        <Divider />

                        <div className="text-left">
                            <Text strong>File Details:</Text>
                            <div className="mt-2 space-y-1">
                                <div>
                                    <Text strong>Type:</Text>{" "}
                                    <Tag>{selectedFileForQR.type.toUpperCase()}</Tag>
                                </div>
                                {selectedFileForQR.size && (
                                    <div>
                                        <Text strong>Size:</Text>{" "}
                                        {(selectedFileForQR.size / 1024 / 1024).toFixed(2)} MB
                                    </div>
                                )}
                                {selectedFileForQR.url && (
                                    <div>
                                        <Text strong>URL:</Text>{" "}
                                        <Text code>{selectedFileForQR.url}</Text>
                                    </div>
                                )}
                                <div>
                                    <Text strong>Created:</Text>{" "}
                                    {new Date(selectedFileForQR.createdAt).toLocaleString()}
                                </div>
                                {selectedFileForQR.tags && selectedFileForQR.tags.length > 0 && (
                                    <div>
                                        <Text strong>Tags:</Text>
                                        <div className="mt-1">
                                            {selectedFileForQR.tags.map((tag) => (
                                                <Tag key={tag}>{tag}</Tag>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>


        </div>
    );
};

export default FileManager;