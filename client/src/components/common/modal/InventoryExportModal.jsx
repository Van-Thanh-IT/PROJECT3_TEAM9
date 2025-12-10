import React, { useState, useEffect, useMemo } from "react";
import { Modal, Form, Input, InputNumber, Select, Button, Table, message, Space, Typography, Divider, Tag } from "antd";
import { PlusOutlined, DeleteOutlined, ExportOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { getAllInventories } from "../../../features/inventory/inventoryThunks"; 

const { Option } = Select;
const { Text } = Typography;

const InventoryExportModal = ({ open, onCancel, onCreate, loading }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  
  // Lấy danh sách tồn kho từ Redux
  const { inventoryNotes } = useSelector((state) => state.inventory);
  
  const [exportItems, setExportItems] = useState([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null); 

  // 1. Fetch dữ liệu khi mở modal
  useEffect(() => {
    if (open && (!inventoryNotes || inventoryNotes.length === 0)) {
      dispatch(getAllInventories());
    }
  }, [open, dispatch, inventoryNotes]);

  // 2. Reset form khi mở
  useEffect(() => {
    if (open) {
      form.resetFields();
      setExportItems([]);
      setSelectedVariant(null);
    }
  }, [open, form]);

  // --- LOGIC THÊM SẢN PHẨM ---
  const handleAddProduct = () => {
    if (!selectedVariant) {
        message.warning("Vui lòng chọn sản phẩm!");
        return;
    }

    if (selectedVariant.current_stock <= 0) {
        message.error("Sản phẩm này đã hết hàng, không thể xuất!");
        return;
    }

    const exists = exportItems.find(item => item.variant_id === selectedVariant.variant_id);
    if (exists) {
        message.warning("Sản phẩm này đã có trong danh sách xuất!");
        return;
    }

    const newItem = {
        key: selectedVariant.variant_id,
        variant_id: selectedVariant.variant_id,
        product_name: selectedVariant.product_name,
        sku: selectedVariant.sku,
        color: selectedVariant.color,
        size: selectedVariant.size,
        current_stock: selectedVariant.current_stock, // Lưu tồn kho để so sánh
        quantity: 1,
        price: selectedVariant.price || 0 
    };

    setExportItems([...exportItems, newItem]);
    setSelectedVariant(null);
  };

  const handleRemoveItem = (id) => {
    setExportItems(exportItems.filter(item => item.variant_id !== id));
  };

  // --- LOGIC CẬP NHẬT GIÁ TRỊ (KHÔNG AUTO FIX, CHỈ SET STATE) ---
  const handleUpdateItem = (id, field, value) => {
    const newItems = exportItems.map(item => {
        if (item.variant_id === id) {
            return { ...item, [field]: value };
        }
        return item;
    });
    setExportItems(newItems);
  };

  // --- XỬ LÝ SUBMIT VÀ VALIDATE ---
  const handleOk = async () => {
    try {
        const values = await form.validateFields();
        
        if (exportItems.length === 0) {
            message.error("Danh sách xuất đang trống!");
            return;
        }

        // --- VALIDATE LOGIC: Kiểm tra từng dòng ---
        for (const item of exportItems) {
            // 1. Kiểm tra số lượng âm hoặc bằng 0
            if (!item.quantity || item.quantity <= 0) {
                message.error(`Sản phẩm "${item.product_name}": Số lượng phải lớn hơn 0`);
                return;
            }
            // 2. Kiểm tra quá tồn kho
            if (item.quantity > item.current_stock) {
                message.error(`Sản phẩm "${item.product_name}": Số lượng xuất (${item.quantity}) vượt quá tồn kho (${item.current_stock})`);
                return; // Dừng ngay, không gửi API
            }
        }

        const payload = {
            reason: values.reason,
            note: values.note,
            items: exportItems.map(item => ({
                variant_id: item.variant_id,
                quantity: item.quantity,
                price: item.price
            }))
        };

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
        const label = `${p?.name} (${v.color} - Size ${v.size}) - Tồn: ${item.quantity}`;
        
        if (!searchProduct || label.toLowerCase().includes(searchProduct.toLowerCase())) {
            options.push({
                value: v.id, 
                label: label,
                variant_id: v.id,
                product_name: p?.name,
                sku: v.sku,
                color: v.color,
                size: v.size,
                current_stock: item.quantity,
                price: v.price 
            });
        }
    });
    return options;
  }, [inventoryNotes, searchProduct]);

  // --- CỘT BẢNG ---
  const columns = [
    {
        title: "Sản phẩm",
        dataIndex: "product_name",
        key: "name",
        render: (text, record) => (
            <div>
                <div className="font-medium">{text}</div>
                <div className="text-xs text-gray-500">
                    {record.sku} | {record.color} | Size {record.size}
                </div>
                <div className="text-xs text-orange-600 font-bold">
                    Tồn kho: {record.current_stock}
                </div>
            </div>
        )
    },
    {
        title: "SL Xuất",
        dataIndex: "quantity",
        key: "qty",
        width: 150,
        render: (val, record) => {
            // Kiểm tra lỗi để hiển thị đỏ
            const isError = val > record.current_stock;
            
            return (
                <div className="flex flex-col">
                    <InputNumber 
                        min={1} 
                        // Bỏ max để cho phép nhập sai, nhưng sẽ báo lỗi
                        value={val} 
                        onChange={(v) => handleUpdateItem(record.variant_id, 'quantity', v)} 
                        className="w-full"
                        status={isError ? "error" : ""} // Viền đỏ nếu lỗi
                    />
                    {isError && (
                        <span className="text-red-500 text-[10px] mt-1">
                            Quá tồn kho ({record.current_stock})
                        </span>
                    )}
                </div>
            );
        }
    },
    {
        title: "Giá xuất",
        dataIndex: "price",
        key: "price",
        width: 150,
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
        render: (_, record) => (
            <span className="font-medium">
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
                onClick={() => handleRemoveItem(record.variant_id)} 
            />
        )
    }
  ];

  const totalAmount = exportItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  // Chỉ dùng loading từ props truyền vào (chỉ xoay khi đang submit)
  const isConfirmLoading = loading;

  return (
    <Modal
      title={<div className="flex items-center gap-2 text-orange-600"><ExportOutlined /> Tạo phiếu Xuất kho</div>}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={isConfirmLoading}
      width={900}
      okText="Xác nhận xuất"
      okButtonProps={{ danger: true }} 
      cancelText="Hủy bỏ"
      style={{ top: 20 }}
      maskClosable={false}
    >
      <Form form={form} layout="vertical" initialValues={{ reason: "Xuất bán" }}>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item 
                name="reason" 
                label="Lý do xuất"
                rules={[{ required: true, message: "Vui lòng chọn lý do" }]}
            >
                <Select>
                    <Option value="Xuất bán">Xuất bán hàng</Option>
                    <Option value="Xuất hủy">Xuất hủy (Hư hỏng/Hết hạn)</Option>
                    <Option value="Xuất khác">Xuất khác (Tặng/Biếu/Chuyển kho)</Option>
                </Select>
            </Form.Item>
             <Form.Item name="note" label="Ghi chú">
                <Input placeholder="Ghi chú thêm (VD: Mã đơn hàng...)" />
            </Form.Item>
        </div>

        <Divider orientation="left" className="text-sm border-gray-400">Chi tiết xuất kho</Divider>

        <div className="flex gap-2 mb-4">
            <Select
                showSearch
                placeholder="Tìm sản phẩm để xuất..."
                optionFilterProp="children"
                onSearch={setSearchProduct}
                // Lấy toàn bộ option object
                onChange={(_, option) => setSelectedVariant(option)}
                value={selectedVariant?.value}
                style={{ flex: 1 }}
                filterOption={false}
            >
                {productOptions.map(opt => (
                    <Option key={opt.value} value={opt.value} {...opt} disabled={opt.current_stock <= 0}>
                        <div className="flex justify-between">
                            <span>{opt.label}</span>
                            {opt.current_stock <= 0 && <Tag color="red">Hết hàng</Tag>}
                        </div>
                    </Option>
                ))}
            </Select>
            <Button type="primary" danger icon={<PlusOutlined />} onClick={handleAddProduct}>
                Thêm
            </Button>
        </div>

        <Table 
            columns={columns} 
            dataSource={exportItems} 
            pagination={false} 
            size="small" 
            bordered
            scroll={{ y: 240 }}
            locale={{ emptyText: "Chưa có sản phẩm nào" }}
            rowKey="key"
        />

        <div className="flex justify-end mt-4">
            <Space>
                <Text>Tổng giá trị xuất:</Text>
                <Text type="warning" className="text-lg font-bold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                </Text>
            </Space>
        </div>

      </Form>
    </Modal>
  );
};

export default InventoryExportModal;