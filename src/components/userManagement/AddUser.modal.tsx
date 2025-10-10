import { Modal } from "antd";
import { useState } from "react";
import UserManagementForm from "./Form";
import { adminService } from "../../services/api";
import useApp from "antd/es/app/useApp";
import { UserManagementRequest } from "../../types";

const AddUserModal = ({
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

  const handleCreateNewUser = async (values: UserManagementRequest) => {
    try {
      setIsSubmitting(true);
      await adminService.createUser(values);
      notification.success({ message: "User created successfully" });
      handleOnCloseModal();
      refetch();
    } catch (error: any) {
      notification.error({
        message: error?.response?.data?.msg || "Failed to create user",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Modal
      title={"Create New User"}
      open={isModalVisible}
      onCancel={() => {
        handleOnCloseModal();
      }}
      footer={null}
      width={500}
    >
      <UserManagementForm
        loading={isSubmitting}
        buttonTitle="Create"
        handleOnCancel={handleOnCloseModal}
        handleOnSubmit={handleCreateNewUser}
      />
    </Modal>
  );
};

export default AddUserModal;
