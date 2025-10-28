import { Modal } from "antd";
import { useState } from "react";
import UserManagementForm from "./Form";
import { adminService } from "../../services/api";
import useApp from "antd/es/app/useApp";
import { User, UserManagementRequest } from "../../types";

const UpdateUserModal = ({
  isModalVisible,
  handleOnCloseModal,
  initialValues,
  refetch,
}: {
  isModalVisible: boolean;
  handleOnCloseModal: () => void;
  initialValues: User;
  refetch: () => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notification } = useApp();

  const handleUpdateUser = async (values: UserManagementRequest) => {
    try {
      setIsSubmitting(true);
      await adminService.updateUser(initialValues._id, values);
      notification.success({ message: "User updated successfully" });
      handleOnCloseModal();
      refetch();
    } catch (error: any) {
      notification.error({
        message: error?.response?.data?.msg || "Failed to update user",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Modal
      title={"Update User"}
      open={isModalVisible}
      onCancel={() => {
        handleOnCloseModal();
      }}
      footer={null}
      width={500}
    >
      <UserManagementForm
        hidePassword
        loading={isSubmitting}
        initialValues={initialValues}
        buttonTitle="Update"
        handleOnCancel={handleOnCloseModal}
        handleOnSubmit={handleUpdateUser}
      />
    </Modal>
  );
};

export default UpdateUserModal;
