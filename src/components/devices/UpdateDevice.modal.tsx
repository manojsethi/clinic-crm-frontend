import { Modal } from "antd";
import DeviceForm from "./DeviceForm";
import { Device } from "../../types";
import { useState } from "react";
import { adminService } from "../../services/api";
import useApp from "antd/es/app/useApp";

const UpdateDeviceModal = ({
  isModalVisible,
  handleOnCloseModal,
  initialValues,
  refetch,
}: {
  isModalVisible: boolean;
  handleOnCloseModal: () => void;
  initialValues: Device;
  refetch: () => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notification } = useApp();

  const handleUpdateDevice = async (values: Partial<Device>) => {
    try {
      setIsSubmitting(true);
      await adminService.updateDevice(initialValues._id, values);
      notification.success({ message: "Device updated successfully" });
      handleOnCloseModal();
      refetch();
    } catch (error: any) {
      notification.error({ message: "Failed to update device" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={"Update Device"}
      open={isModalVisible}
      onCancel={() => {
        handleOnCloseModal();
      }}
      footer={null}
      width={500}
    >
      <DeviceForm
        initialValues={initialValues}
        buttonTitle="Update"
        loading={isSubmitting}
        handleOnCancel={handleOnCloseModal}
        handleOnSubmit={handleUpdateDevice as any}
      />
    </Modal>
  );
};

export default UpdateDeviceModal;


