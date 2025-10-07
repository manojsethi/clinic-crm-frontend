import { Modal } from "antd";
import { useState } from "react";
import DeviceForm from "./DeviceForm";
import { adminService } from "../../services/api";
import useApp from "antd/es/app/useApp";
import { DeviceRequest } from "../../types";

const AddDeviceModal = ({
  isModalVisible,
  handleOnCloseModal,
  refetch,
}: {
  isModalVisible: boolean;
  handleOnCloseModal: () => void;
  refetch: () => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notification } = useApp();

  const handleCreateNewDevice = async (values: DeviceRequest) => {
    try {
      setIsSubmitting(true);
      await adminService.createDevice(values);
      notification.success({ message: "Device created successfully" });
      handleOnCloseModal();
      refetch();
    } catch (error: any) {
      notification.error({
        message: error?.response?.data?.msg || "Failed to create device",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Modal
      title={"Create New Device"}
      open={isModalVisible}
      onCancel={() => {
        handleOnCloseModal();
      }}
      footer={null}
      width={500}
    >
      <DeviceForm
        loading={isSubmitting}
        buttonTitle="Create"
        handleOnCancel={handleOnCloseModal}
        handleOnSubmit={handleCreateNewDevice}
      />
    </Modal>
  );
};

export default AddDeviceModal;


