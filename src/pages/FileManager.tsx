import React, { useState } from "react";
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
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [searchText, setSearchText] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [uploadType, setUploadType] = useState<"file" | "image" | "url">(
        "file"
    );
    const [currentStep, setCurrentStep] = useState(0);
    const [uploadedFile, setUploadedFile] = useState<FileItem | null>(null);

    // Mock data for demonstration
    const mockFiles: FileItem[] = [
        {
            _id: "1",
            name: "Patient Report.pdf",
            type: "file",
            size: 1024000,
            mimeType: "application/pdf",
            description: "Patient medical report",
            tags: ["medical", "report"],
            createdAt: "2024-01-15T10:30:00Z",
            updatedAt: "2024-01-15T10:30:00Z",
            createdBy: "doctor1",
            qrCode: "qr_code_1",
            isActive: true,
        },
        {
            _id: "2",
            name: "X-Ray Image",
            type: "image",
            size: 2048000,
            mimeType: "image/jpeg",
            description: "Chest X-ray image",
            tags: ["xray", "chest"],
            createdAt: "2024-01-14T14:20:00Z",
            updatedAt: "2024-01-14T14:20:00Z",
            createdBy: "doctor1",
            qrCode: "qr_code_2",
            isActive: true,
        },
        {
            _id: "3",
            name: "Medical Guidelines",
            type: "url",
            url: "https://example.com/guidelines",
            description: "External medical guidelines",
            tags: ["guidelines", "reference"],
            createdAt: "2024-01-13T09:15:00Z",
            updatedAt: "2024-01-13T09:15:00Z",
            createdBy: "doctor1",
            qrCode: "qr_code_3",
            isActive: true,
        },
    ];

    React.useEffect(() => {
        setFiles(mockFiles);
    }, []);

    const handleUpload = async (values: any) => {
        try {
            
            setLoading(true);
            if(uploadType==="url") {

            }
            console.log(values,"heyVALUES")

            // Simulate API call
            // await new Promise((resolve) => setTimeout(resolve, 1000));

            // let newFile: FileItem;

            // if (uploadType === "url") {
            //     newFile = {
            //         _id: Date.now().toString(),
            //         name: values.name,
            //         type: "url",
            //         url: values.url,
            //         description: values.description || "",
            //         tags: values.tags || [],
            //         createdAt: new Date().toISOString(),
            //         updatedAt: new Date().toISOString(),
            //         createdBy: "current_user",
            //         qrCode: `qr_${Date.now()}`,
            //         isActive: true,
            //     };
            // } else {
            //     // For file/image uploads, we'll handle this in the customRequest
            //     return;
            // }

            // setUploadedFile(newFile);
            // setFiles((prev) => [newFile, ...prev]);
            // setCurrentStep(2); // Move to QR generation step
            // message.success(
            //     `${uploadType === "url" ? "URL" : "File"} uploaded successfully!`
            // );
        } catch (error) {
            message.error(`Failed to upload ${uploadType}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload: UploadProps["customRequest"] = async ({
        file,
        onSuccess,
        onError,
    }) => {
        try {
            setLoading(true);

            await new Promise((resolve) => setTimeout(resolve, 1000));

            const newFile: FileItem = {
                _id: Date.now().toString(),
                name: (file as File).name,
                type: uploadType,
                size: (file as File).size,
                mimeType: (file as File).type,
                description: uploadForm.getFieldValue("description") || "",
                tags: uploadForm.getFieldValue("tags") || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: "current_user",
                qrCode: `qr_${Date.now()}`,
                isActive: true,
            };

            setUploadedFile(newFile);
            setFiles((prev) => [newFile, ...prev]);
            setCurrentStep(2);
            message.success("File uploaded successfully!");
            onSuccess?.(newFile);
        } catch (error) {
            message.error("Failed to upload file");
            onError?.(error as Error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateQR = (file: FileItem) => {
        setSelectedFile(file);
        setQrModalVisible(true);
    };

    const handleResetUpload = () => {
        setCurrentStep(0);
        setUploadedFile(null);
        uploadForm.resetFields();
        setUploadType("file");
    };

    const handleDeleteFile = (fileId: string) => {
        setFiles((prev) => prev.filter((file) => file._id !== fileId));
        message.success("File deleted successfully!");
    };

    const filteredFiles = files.filter((file) => {
        const matchesSearch =
            file.name.toLowerCase().includes(searchText.toLowerCase()) ||
            file.description?.toLowerCase().includes(searchText.toLowerCase());
        const matchesType = filterType === "all" || file.type === filterType;
        return matchesSearch && matchesType;
    });

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
                    <Tooltip title="View">
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
                    </Tooltip>
                    <Tooltip title="Download">
                        <Button
                            icon={<DownloadOutlined />}
                            size="small"
                            onClick={() => message.info("Download not implemented yet")}
                        />
                    </Tooltip>
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
        customRequest: handleFileUpload,
        showUploadList: false,
        accept: "*/*",
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
                                        description: "Upload your file or add URL",
                                    },
                                    {
                                        title: "Generate Scanner",
                                        description: "Create QR code for access",
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

                                    <Form
                                        form={uploadForm}
                                        layout="vertical"
                                        onFinish={handleUpload}
                                    >
                                        {uploadType === "url" ? (
                                            <>


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
                                            </>
                                        ) : (
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
                                                        area to upload
                                                    </p>
                                                    <p className="ant-upload-hint">
                                                        {uploadType === "image"
                                                            ? "Support for single image upload. JPG, PNG, GIF are supported."
                                                            : "Support for single file upload. All file types are supported."}
                                                    </p>
                                                </Upload.Dragger>
                                            </Form.Item>
                                        )}

                                        <Form.Item name="description" label="Description">
                                            <TextArea
                                                rows={3}
                                                placeholder="Enter description (optional)"
                                            />
                                        </Form.Item>



                                        <Form.Item>
                                            <Space>
                                                <Button onClick={() => setCurrentStep(0)}>Back</Button>
                                                {uploadType === "url" ? (
                                                    <Button
                                                        type="primary"
                                                        htmlType="submit"
                                                        loading={loading}
                                                        icon={<PlusOutlined />}
                                                    >
                                                        Add URL
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="primary"
                                                        onClick={() => setCurrentStep(2)}
                                                        disabled={!uploadedFile}
                                                    >
                                                        Continue to Scanner
                                                    </Button>
                                                )}
                                            </Space>
                                        </Form.Item>
                                    </Form>
                                </div>
                            )}

                            {currentStep === 2 && uploadedFile && (
                                <div className="text-center">
                                    <Title level={3} className="mb-6">
                                        Generate Scanner
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
                                            value={uploadedFile.qrCode || uploadedFile._id}
                                            size={200}
                                            level="M"
                                        />
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
                                            View Full Scanner
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
                {selectedFile && (
                    <div className="text-center">
                        <div className="mb-4">
                            <Text strong className="text-lg">
                                {selectedFile.name}
                            </Text>
                            <br />
                            <Text type="secondary">{selectedFile.description}</Text>
                        </div>

                        <div className="flex justify-center mb-4">
                            <QRCodeSVG
                                value={selectedFile.qrCode || selectedFile._id}
                                size={200}
                                level="M"
                            />
                        </div>

                        <Divider />

                        <div className="text-left">
                            <Text strong>File Details:</Text>
                            <div className="mt-2 space-y-1">
                                <div>
                                    <Text strong>Type:</Text>{" "}
                                    <Tag>{selectedFile.type.toUpperCase()}</Tag>
                                </div>
                                {selectedFile.size && (
                                    <div>
                                        <Text strong>Size:</Text>{" "}
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </div>
                                )}
                                {selectedFile.url && (
                                    <div>
                                        <Text strong>URL:</Text>{" "}
                                        <Text code>{selectedFile.url}</Text>
                                    </div>
                                )}
                                <div>
                                    <Text strong>Created:</Text>{" "}
                                    {new Date(selectedFile.createdAt).toLocaleString()}
                                </div>
                                {selectedFile.tags && selectedFile.tags.length > 0 && (
                                    <div>
                                        <Text strong>Tags:</Text>
                                        <div className="mt-1">
                                            {selectedFile.tags.map((tag) => (
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