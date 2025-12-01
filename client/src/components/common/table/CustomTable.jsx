import React from "react";
import { Table } from "antd";

const CustomTable = ({
  columns = [],
  data = [],
  loading = false,
  pagination = { pageSize: 5 },
  rowSelection = null,
  onChange,
  bordered = false,
  size = "middle",
  scroll = { x: "max-content" }, 
}) => {
  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination} 
      rowSelection={rowSelection}
      onChange={onChange}
      bordered={bordered}
      size={size}
      scroll={scroll} 
      rowKey={(record) => record.id || record.key}
    />
  );
};

export default CustomTable;

