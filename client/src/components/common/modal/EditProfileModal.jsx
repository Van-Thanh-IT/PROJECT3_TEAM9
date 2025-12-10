// src/components/profile/EditProfileModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Select, Upload, Button, message } from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import { updateInfo } from "../../../features/user/userThunks";
import { getMe } from "../../../features/auth/authSlice"; 

const { Option } = Select;

const EditProfileModal = ({ open, onCancel, user }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (open && user) {
      form.setFieldsValue({
        username: user.username,
        phone: user.phone,
        gender: user.gender || "other",
        date_of_birth: user.date_of_birth ? dayjs(user.date_of_birth) : null,
      });
      setFileList([]);
    }
  }, [open, user, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("username", values.username);
      formData.append("phone", values.phone || "");
      formData.append("gender", values.gender);

      if (values.date_of_birth) {
        formData.append("date_of_birth", values.date_of_birth.format("YYYY-MM-DD"));
      }

      if (fileList.length > 0) {
        formData.append("avatar", fileList[0].originFileObj);
      }

      const action = await dispatch(updateInfo(formData));

      if (updateInfo.fulfilled.match(action)) {
        message.success("Cập nhật thông tin thành công!");
        dispatch(getMe());
        onCancel();
      } else {
        message.error(action.payload?.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Validate Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1));
  };

  return (
    <Modal
      title="Cập nhật thông tin cá nhân"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Lưu thay đổi"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" name="edit_profile_form">

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="text-center">
            <div className="mb-3">
              <img
                src={
                  fileList.length > 0
                    ? URL.createObjectURL(fileList[0].originFileObj)
                    : user?.avatar || "https://via.placeholder.com/100"
                }
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover border border-gray-200 mx-auto"
              />
            </div>
            <Upload
              listType="text"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Đổi ảnh đại diện</Button>
            </Upload>
          </div>
        </div>

        {/* Username */}
        <Form.Item
          name="username"
          label="Tên hiển thị"
          rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Nhập tên của bạn" />
        </Form.Item>

        {/* Phone */}
        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[{ pattern: /^[0-9]+$/, message: "Số điện thoại chỉ chứa số" }]}
        >
          <Input placeholder="09xxxxxxxx" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="gender" label="Giới tính">
            <Select>
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item name="date_of_birth" label="Ngày sinh">
            <DatePicker format="DD/MM/YYYY" className="w-full" placeholder="Chọn ngày" />
          </Form.Item>
        </div>

      </Form>
    </Modal>
  );
};

export default EditProfileModal;
