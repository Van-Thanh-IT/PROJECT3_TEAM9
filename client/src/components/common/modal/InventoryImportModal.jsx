import React, { useState, useEffect, useMemo } from "react";
import { Modal, Form, Input, InputNumber, Select, Button, Table, message, Space, Typography, Divider } from "antd";
import { PlusOutlined, DeleteOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { getAllInventories } from "../../../features/inventory/inventoryThunks"; 

const { Option } = Select;
const { Text } = Typography;

const InventoryImportModal = ({ open, onCancel, onCreate, loading }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  
  // Lấy danh sách tồn kho để làm nguồn chọn sản phẩm
  const { inventoryNotes, status } = useSelector((state) => state.inventory);
  
  const [importItems, setImportItems] = useState([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null); 

  // 1. Fetch dữ liệu khi mở Modal
  useEffect(() => {
    if (open && (!inventoryNotes || inventoryNotes.length === 0)) {
      dispatch(getAllInventories());
    }
  }, [open, dispatch, inventoryNotes]);

  // 2. Reset form khi mở/đóng
  useEffect(() => {
    if (open) {
      form.resetFields();
      setImportItems([]);
      setSelectedVariant(null);
    }
  }, [open, form]);

  // --- LOGIC THÊM SẢN PHẨM (Đã sửa lỗi chọn) ---
  const handleAddProduct = () => {
    // Lưu ý: selectedVariant ở đây là object option { value, label, variant_id, ... }
    if (!selectedVariant) {
        message.warning("Vui lòng chọn một biến thể sản phẩm!");
        return;
    }

    const variantIdToAdd = selectedVariant.variant_id;

    // Check trùng
    const exists = importItems.find(item => item.variant_id === variantIdToAdd);
    if (exists) {
        message.warning("Sản phẩm này đã có trong danh sách nhập!");
        return;
    }

    const newItem = {
        key: variantIdToAdd, // Key cho Table Antd
        variant_id: variantIdToAdd,
        product_name: selectedVariant.product_name,
        sku: selectedVariant.sku,
        color: selectedVariant.color,
        size: selectedVariant.size,
        current_stock: selectedVariant.current_stock,
        quantity: 1,
        price: 0
    };

    setImportItems([...importItems, newItem]);
    setSelectedVariant(null); // Reset ô select
  };

  // --- LOGIC XÓA ITEM (Đã kiểm tra kỹ) ---
  const handleRemoveItem = (variantId) => {
    const newItems = importItems.filter(item => item.variant_id !== variantId);
    setImportItems(newItems);
  };

  // --- LOGIC CẬP NHẬT ---
  const handleUpdateItem = (variantId, field, value) => {
    const newItems = importItems.map(item => {
        if (item.variant_id === variantId) {
            return { ...item, [field]: value };
        }
        return item;
    });
    setImportItems(newItems);
  };

  // --- SUBMIT FORM ---
  const handleOk = async () => {
    try {
        const values = await form.validateFields();
        
        if (importItems.length === 0) {
            message.error("Vui lòng thêm ít nhất 1 sản phẩm!");
            return;
        }

        const invalidItem = importItems.find(item => item.quantity <= 0);
        if (invalidItem) {
            message.error(`Sản phẩm ${invalidItem.product_name} phải có số lượng > 0`);
            return;
        }

        const payload = {
            supplier_name: values.supplier_name,
            reason: values.reason || "Nhập hàng nhà cung cấp",
            note: values.note,
            items: importItems.map(item => ({
                variant_id: item.variant_id,
                quantity: item.quantity,
                price: item.price
            }))
        };

        // Gọi hàm onCreate được truyền từ cha (InventoryList)
        // Lưu ý: onCreate ở cha phải xử lý đóng modal (setIsImportModalOpen(false))
        onCreate(payload); 

    } catch (error) {
        console.error("Validate Failed:", error);
    }
  };

  // --- PREPARE OPTIONS ---
  const productOptions = useMemo(() => {
    if (!Array.isArray(inventoryNotes)) return [];

    let options = [];
    inventoryNotes.forEach(item => {
        const v = item.variant;
        if (!v) return;

        const p = v.product;
        const label = `${p?.name} (${v.color} - Size ${v.size}) - SKU: ${v.sku}`;
        
        if (!searchProduct || label.toLowerCase().includes(searchProduct.toLowerCase())) {
            options.push({
                value: v.id, 
                label: label,
                // Extra data để dùng khi add
                variant_id: v.id,
                product_name: p?.name,
                sku: v.sku,
                color: v.color,
                size: v.size,
                current_stock: item.quantity
            });
        }
    });
    return options;
  }, [inventoryNotes, searchProduct]);

  // --- COLUMNS ---
  const columns = [
    {
        title: "Sản phẩm",
        dataIndex: "product_name",
        key: "name",
        render: (text, record) => (
            <div>
                <div className="font-medium text-blue-600">{text}</div>
                <div className="text-xs text-gray-500">
                    {record.sku} | {record.color} | Size {record.size}
                </div>
                <div className="text-xs text-green-600">
                    Kho hiện tại: {record.current_stock}
                </div>
            </div>
        )
    },
    {
        title: "SL Nhập",
        dataIndex: "quantity",
        key: "qty",
        width: 100,
        render: (val, record) => (
            <InputNumber 
                min={1} 
                value={val} 
                onChange={(v) => handleUpdateItem(record.variant_id, 'quantity', v)} 
                className="w-full"
            />
        )
    },
    {
        title: "Giá nhập",
        dataIndex: "price",
        key: "price",
        width: 130,
        render: (val, record) => (
            <InputNumber 
                min={0} 
                value={val} 
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                onChange={(v) => handleUpdateItem(record.variant_id, 'price', v)} 
                className="w-full"
            />
        )
    },
    {
        title: "Thành tiền",
        key: "total",
        align: "right",
        width: 120,
        render: (_, record) => (
            <span className="font-medium text-gray-700">
                {new Intl.NumberFormat('vi-VN').format(record.quantity * record.price)}
            </span>
        )
    },
    {
        title: "",
        key: "action",
        width: 50,
        align: "center",
        render: (_, record) => (
            <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                // Quan trọng: Truyền đúng variant_id để xóa
                onClick={() => handleRemoveItem(record.variant_id)} 
            />
        )
    }
  ];

  const totalAmount = importItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  // FIX QUAN TRỌNG: Chỉ loading khi props loading = true (do component cha truyền vào khi ĐANG GỌI API TẠO)
  // Không lấy status từ redux vì nó bị lẫn với status của việc fetch list
  const isConfirmLoading = loading; 

  return (
    <Modal
      title={<div className="flex items-center gap-2"><ShoppingCartOutlined /> Tạo phiếu Nhập kho</div>}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={isConfirmLoading} // Sử dụng biến loading từ props
      width={900}
      okText="Xác nhận nhập"
      cancelText="Hủy bỏ"
      style={{ top: 20 }}
      maskClosable={false}
    >
      <Form form={form} layout="vertical" initialValues={{ reason: "Nhập hàng nhà cung cấp" }}>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item 
                name="supplier_name" 
                label="Nhà cung cấp" 
                rules={[{ required: true, message: "Vui lòng nhập tên NCC" }]}
            >
                <Input placeholder="Ví dụ: Nike Vietnam..." />
            </Form.Item>

            <Form.Item name="reason" label="Lý do nhập">
                <Select>
                    <Option value="Nhập hàng nhà cung cấp">Nhập hàng nhà cung cấp</Option>
                    <Option value="Khách trả hàng">Khách trả hàng</Option>
                    <Option value="Khác">Khác</Option>
                </Select>
            </Form.Item>
        </div>

        <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Ghi chú thêm về lô hàng..." />
        </Form.Item>

        <Divider orientation="left" className="text-sm border-gray-400">Chi tiết hàng hóa</Divider>

        {/* Khu vực chọn sản phẩm */}
        <div className="flex gap-2 mb-4">
            <Select
                showSearch
                placeholder="Tìm kiếm sản phẩm (Tên, SKU...)"
                optionFilterProp="children"
                onSearch={setSearchProduct}
                // Quan trọng: Lấy trọn object option để có đủ thông tin
                onChange={(_, option) => setSelectedVariant(option)} 
                value={selectedVariant?.value}
                style={{ flex: 1 }}
                filterOption={false}
            >
                {productOptions.map(opt => (
                    <Option key={opt.value} value={opt.value} {...opt}>
                        {opt.label}
                    </Option>
                ))}
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProduct}>
                Thêm vào phiếu
            </Button>
        </div>

        {/* Bảng sản phẩm đã chọn */}
        <Table 
            columns={columns} 
            dataSource={importItems} 
            pagination={false} 
            size="small" 
            bordered
            scroll={{ y: 240 }}
            locale={{ emptyText: "Chưa có sản phẩm nào trong phiếu" }}
            rowKey="key" 
        />

        <div className="flex justify-end mt-4">
            <Space>
                <Text>Tổng giá trị phiếu nhập:</Text>
                <Text type="danger" className="text-lg font-bold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                </Text>
            </Space>
        </div>

      </Form>
    </Modal>
  );
};

export default InventoryImportModal;