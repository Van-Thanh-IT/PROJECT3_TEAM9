import React, { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
    fetchTickets, 
    fetchMessages, 
    sendMessage 
} from "../../features/support/supportTicketThunks";
import { addRealtimeMessage } from "../../features/support/supportTicketSlice";
import echo from "../../utils/echo";

import { 
    Layout, List, Avatar, Input, Button, Spin, Tag, Badge, Tabs, Empty, Tooltip, Image, Card, Typography, Divider, Popover, Upload
} from "antd";
import { 
    UserOutlined, 
    SendOutlined, 
    PaperClipOutlined, 
    CheckCircleOutlined,
    SearchOutlined,
    CheckCircleFilled,
    SmileOutlined,
    CloseCircleFilled,
    FileTextOutlined,
    InboxOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/vi';
import EmojiPicker from 'emoji-picker-react'; // Import thư viện Emoji

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Sider, Content } = Layout;
const { TextArea } = Input;
const { Text, Title } = Typography;

const SupportManagement = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { tickets, messages } = useSelector((state) => state.support);

    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [msgContent, setMsgContent] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("open"); 
    
    // --- STATE MỚI CHO ẢNH & EMOJI ---
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showEmoji, setShowEmoji] = useState(false);

    const messagesEndRef = useRef(null);

    // 1. Fetch Data
    useEffect(() => {
        dispatch(fetchTickets());
    }, [dispatch]);

    // 2. Fetch Messages
    useEffect(() => {
        if (selectedTicketId) {
            dispatch(fetchMessages(selectedTicketId));
        }
    }, [dispatch, selectedTicketId]);

    // 3. Realtime Listener
    useEffect(() => {
        if (selectedTicketId) {
            const channel = echo.channel(`ticket.${selectedTicketId}`);
            channel.listen('.MessageSent', (e) => {
                if (e.message.sender_id !== user.id) {
                    dispatch(addRealtimeMessage(e.message));
                }
            });
            return () => echo.leave(`ticket.${selectedTicketId}`);
        }
    }, [selectedTicketId, dispatch, user]);

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, selectedTicketId, previewUrl]);

    // --- XỬ LÝ FILE ---
    const handleFileSelect = (file) => {
        setSelectedFile(file);
        if (file.type.startsWith('image/')) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
        return false; 
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    // --- XỬ LÝ EMOJI ---
    const onEmojiClick = (emojiObject) => {
        setMsgContent(prev => prev + emojiObject.emoji);
    };

    const handleSend = async () => {
        if (!msgContent.trim() && !selectedFile) return;
        
        await dispatch(sendMessage({
            ticket_id: selectedTicketId,
            message: msgContent,
            file: selectedFile
        }));
        
        setMsgContent("");
        removeFile();
        setShowEmoji(false);
    };

    // Filter Logic
    const filteredTickets = useMemo(() => {
        let data = tickets;
        if (activeTab === 'open') {
            data = data.filter(t => t.status !== 'closed');
        } else {
            data = data.filter(t => t.status === 'closed');
        }
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            data = data.filter(t => 
                t.user?.username?.toLowerCase().includes(lower) || 
                t.subject?.toLowerCase().includes(lower) ||
                t.order_id?.toString().includes(lower)
            );
        }
        return data; 
    }, [tickets, searchTerm, activeTab]);

    const currentTicket = tickets.find(t => t.id === selectedTicketId);
    const currentMessages = messages[selectedTicketId] || [];

    return (
        <Layout className="h-[calc(100vh-64px)] bg-white overflow-hidden">
            
            {/* ================= CỘT 1: DANH SÁCH (INBOX) ================= */}
            <Sider width={320} theme="light" className="border-r border-gray-200 flex flex-col z-20">
                <div className="px-4 pt-4 pb-2">
                    <Title level={4} className="mb-4">Hộp thư hỗ trợ</Title>
                    <Input 
                        prefix={<SearchOutlined className="text-gray-400" />} 
                        placeholder="Tìm tên, mã đơn..." 
                        className="rounded-lg bg-gray-50 border-gray-200 hover:bg-white focus:bg-white mb-4"
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Tabs 
                        activeKey={activeTab} 
                        onChange={setActiveTab} 
                        className="custom-tabs"
                        items={[
                            { key: 'open', label: `Cần xử lý (${tickets.filter(t=>t.status!=='closed').length})` },
                            { key: 'closed', label: 'Đã đóng' },
                        ]}
                    />
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <List
                        dataSource={filteredTickets}
                        renderItem={(item) => (
                            <List.Item 
                                className={`cursor-pointer px-4 py-3 border-b border-gray-50 transition-all hover:bg-gray-50 ${
                                    selectedTicketId === item.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                }`}
                                onClick={() => setSelectedTicketId(item.id)}
                            >
                                <div className="flex gap-3 w-full">
                                    <Badge dot={item.status === 'open'} color="blue" offset={[-2, 2]}>
                                        <Avatar src={item.user?.avatar} icon={<UserOutlined />} className="bg-gray-200" size={40} />
                                    </Badge>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <Text strong className="text-gray-800 text-sm truncate w-24">
                                                {item.user?.username || item.email}
                                            </Text>
                                            <Text type="secondary" className="text-[10px]">
                                                {dayjs(item.updated_at).fromNow(true)}
                                            </Text>
                                        </div>
                                        <Text type="secondary" className="text-xs truncate block text-gray-500 mb-1">
                                            {item.subject}
                                        </Text>
                                        {item.order_id && (
                                            <Tag bordered={false} className="text-[10px] bg-gray-100 text-gray-500 m-0 px-1.5 rounded-sm">
                                                Đơn #{item.order_id}
                                            </Tag>
                                        )}
                                    </div>
                                </div>
                            </List.Item>
                        )}
                        locale={{ emptyText: <Empty description="Hộp thư trống" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                    />
                </div>
            </Sider>

            {/* ================= CỘT 2: KHUNG CHAT (CENTER) ================= */}
            <Layout>
                <Content className="flex flex-col bg-white relative">
                    {selectedTicketId && currentTicket ? (
                        <>
                            {/* Header Chat */}
                            <div className="h-16 px-6 border-b border-gray-200 flex justify-between items-center bg-white">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Title level={5} className="m-0">{currentTicket.user?.username || "Khách vãng lai"}</Title>
                                        <Tag color={currentTicket.status === 'open' ? 'processing' : 'default'} className="border-none">
                                            {currentTicket.status === 'open' ? 'Đang mở' : 'Đã đóng'}
                                        </Tag>
                                    </div>
                                    <Text type="secondary" className="text-xs">Ticket ID: #{selectedTicketId} • {currentTicket.email}</Text>
                                </div>
                                
                                {currentTicket.status !== 'closed' && (
                                    <Button 
                                        type="primary" 
                                        ghost 
                                        icon={<CheckCircleOutlined />} 
                                        className="border-green-500 text-green-600 hover:bg-green-50"
                                    >
                                        Hoàn thành
                                    </Button>
                                )}
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 bg-[#f8f9fa] space-y-4">
                                {currentMessages.map((msg) => {
                                    const isMe = msg.sender_type !== 'user'; // Admin/Staff là Me
                                    
                                    return (
                                        <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                            <div className={`flex max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                                                
                                                {/* Avatar */}
                                                <Avatar 
                                                    src={isMe ? user?.avatar : currentTicket.user?.avatar} 
                                                    icon={<UserOutlined />} 
                                                    size={32}
                                                    className={isMe ? 'bg-blue-600' : 'bg-white border border-gray-200 text-gray-500'} 
                                                />

                                                <div className="flex flex-col gap-1">
                                                    {/* Bong bóng chat */}
                                                    <div className={`px-4 py-2.5 text-[14px] shadow-sm whitespace-pre-wrap leading-relaxed ${
                                                        isMe 
                                                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                                                        : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100'
                                                    }`}>
                                                        {msg.message}
                                                        
                                                        {/* Hiển thị Ảnh đính kèm */}
                                                        {msg.attachment_url && (
                                                            <div className="mt-2 pt-2 border-t border-white/20">
                                                                {msg.attachment_type?.startsWith('image/') ? (
                                                                    <Image 
                                                                        src={msg.attachment_url} 
                                                                        width={150} 
                                                                        className="rounded-lg object-cover" 
                                                                    />
                                                                ) : (
                                                                    <a href={msg.attachment_url} target="_blank" rel="noreferrer" className={`flex items-center gap-1 hover:underline ${isMe ? 'text-white' : 'text-blue-600'}`}>
                                                                        <PaperClipOutlined /> Tải file
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Thời gian */}
                                                    <div className={`text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'text-right' : 'text-left'}`}>
                                                        {dayjs(msg.created_at).format("HH:mm")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* --- Input Area --- */}
                            <div className="bg-white border-t border-gray-200">
                                
                                {/* Preview Ảnh/File */}
                                {selectedFile && (
                                    <div className="px-4 pt-3 pb-1 flex items-center">
                                        <div className="relative bg-gray-100 rounded-lg p-2 border border-gray-200 inline-flex items-center gap-3">
                                            <div onClick={removeFile} className="absolute -top-2 -right-2 bg-white rounded-full cursor-pointer hover:scale-110 shadow-sm text-red-500">
                                                <CloseCircleFilled />
                                            </div>
                                            {previewUrl ? (
                                                <Image src={previewUrl} width={50} height={50} className="rounded object-cover" preview={false} />
                                            ) : (
                                                <FileTextOutlined className="text-2xl text-blue-500 mx-2" />
                                            )}
                                            <div className="text-xs truncate max-w-[100px]">{selectedFile.name}</div>
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 flex items-end gap-3 max-w-4xl mx-auto">
                                    {/* Upload Button */}
                                    <Upload 
                                        beforeUpload={handleFileSelect} 
                                        showUploadList={false} 
                                        maxCount={1}
                                        accept="image/*,.pdf,.doc,.docx"
                                    >
                                        <Tooltip title="Gửi ảnh/file">
                                            <Button type="text" shape="circle" icon={<PaperClipOutlined className="text-xl text-gray-500" />} />
                                        </Tooltip>
                                    </Upload>
                                    
                                    <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-blue-400 focus-within:bg-white transition-all px-3 py-2 relative flex items-center">
                                        <TextArea 
                                            value={msgContent}
                                            onChange={(e) => setMsgContent(e.target.value)}
                                            placeholder="Nhập câu trả lời..." 
                                            autoSize={{ minRows: 1, maxRows: 4 }}
                                            className="bg-transparent border-none shadow-none focus:shadow-none text-sm p-0 resize-none flex-1"
                                            onPressEnter={(e) => {
                                                if(!e.shiftKey) { e.preventDefault(); handleSend(); }
                                            }}
                                        />

                                        {/* Emoji Button */}
                                        <Popover 
                                            content={
                                                <EmojiPicker 
                                                    onEmojiClick={onEmojiClick} 
                                                    width={300} 
                                                    height={350} 
                                                    searchDisabled 
                                                    skinTonesDisabled 
                                                />
                                            } 
                                            trigger="click"
                                            open={showEmoji}
                                            onOpenChange={setShowEmoji}
                                            placement="topLeft"
                                        >
                                            <Button type="text" shape="circle" icon={<SmileOutlined className="text-lg text-gray-400 hover:text-orange-500" />} />
                                        </Popover>
                                    </div>

                                    <Button 
                                        type="primary" 
                                        shape="circle" 
                                        size="large"
                                        icon={<SendOutlined />} 
                                        onClick={handleSend} 
                                        className="bg-blue-600 shadow-md border-none flex-shrink-0"
                                        disabled={!msgContent.trim() && !selectedFile}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <InboxOutlined className="text-4xl text-gray-300" />
                            </div>
                            <p className="text-lg font-medium text-gray-500">Chọn hội thoại để bắt đầu hỗ trợ</p>
                        </div>
                    )}
                </Content>

                {/* ================= CỘT 3: THÔNG TIN KHÁCH (RIGHT SIDEBAR) ================= */}
                {selectedTicketId && currentTicket && (
                    <Sider width={300} theme="light" className="border-l border-gray-200 p-5 hidden xl:block overflow-y-auto z-10">
                        <div className="text-center mb-6">
                            <Avatar size={80} src={currentTicket.user?.avatar} icon={<UserOutlined />} className="mb-3 bg-gray-100 border border-gray-200" />
                            <Title level={4} className="m-0 mb-1">{currentTicket.user?.username || "Khách hàng"}</Title>
                            <Text type="secondary" className="text-xs">Email: {currentTicket.email}</Text>
                        </div>

                        <Divider className="my-4" />

                        {/* Order Context */}
                        <div className="space-y-4">
                            <div>
                                <Text type="secondary" className="text-xs uppercase font-bold tracking-wide">Đơn hàng đang hỗ trợ</Text>
                                {currentTicket.order_id ? (
                                    <Card 
                                        size="small" 
                                        className="mt-2 border-blue-100 bg-blue-50/30 cursor-pointer hover:border-blue-300 transition-colors"
                                        title={<span className="text-blue-600 font-semibold">#{currentTicket.order_id}</span>}
                                        extra={<Button type="link" size="small" className="p-0 text-xs">Chi tiết</Button>}
                                    >
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500">Trạng thái:</span>
                                            <Tag color="processing" className="m-0 border-none">Đang giao</Tag>
                                        </div>
                                    </Card>
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded text-center text-gray-400 text-xs mt-2">
                                        Không có đơn hàng liên quan
                                    </div>
                                )}
                            </div>
                        </div>

                        <Divider className="my-4" />

                        {/* Quick Actions */}
                        <div>
                            <Text type="secondary" className="text-xs uppercase font-bold tracking-wide">Thao tác</Text>
                            <div className="mt-2 space-y-2">
                                <Button block icon={<CheckCircleFilled />} className="text-left">Đánh dấu đã xong</Button>
                                <Button block danger type="text" className="text-left text-red-500 hover:bg-red-50">Chặn người dùng này</Button>
                            </div>
                        </div>
                    </Sider>
                )}
            </Layout>
        </Layout>
    );
};

export default SupportManagement;