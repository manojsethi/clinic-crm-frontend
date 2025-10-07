import { Modal } from "antd";
import UserManagementForm from "./Form";
import { User } from "../../types";

const UpdateUserModal = ({
  isModalVisible,
  handleOnCloseModal,
  initialValues,
}: {
  isModalVisible: boolean;
  handleOnCloseModal: () => void;
  initialValues: User;
}) => {
  const handleUpdateUser = () => {};
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
        initialValues={initialValues}
        buttonTitle="Update"
        handleOnCancel={handleOnCloseModal}
        handleOnSubmit={handleUpdateUser}
      />
    </Modal>
  );
};

export default UpdateUserModal;
