import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom"; 
import { 
    fetchTickets, 
    fetchMessages, 
    sendMessage, 
} from "../../features/support/supportTicketThunks";
import { addRealtimeMessage } from "../../features/support/supportTicketSlice";
import echo from "../../utils/echo";

// --- THƯ VIỆN UI ---
import { 
    Layout, Input, Button, Spin, Form, Upload, Image, Card, Empty, Alert, Tag, Avatar, Popover 
} from "antd";
import { 
    CustomerServiceOutlined, 
    SendOutlined, 
    PaperClipOutlined, 
    SmileOutlined,
    CloseCircleFilled,
    FileTextOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

// --- THƯ VIỆN EMOJI ---
import EmojiPicker from 'emoji-picker-react';

const { TextArea } = Input;

const UserSupportPage = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    
    const { user } = useSelector((state) => state.auth);
    const { tickets, messages} = useSelector((state) => state.support);
    
    const contextOrderId = location.state?.orderId;

    // --- STATE QUẢN LÝ ---
    const [msgContent, setMsgContent] = useState("");
    const [selectedFile, setSelectedFile] = useState(null); // File object thực tế
    const [previewUrl, setPreviewUrl] = useState(null);     // URL để hiển thị ảnh preview
    const [showEmoji, setShowEmoji] = useState(false);      // Ẩn/hiện bảng emoji

    const messagesEndRef = useRef(null);

    // 1. Fetch data ban đầu
    useEffect(() => {
        dispatch(fetchTickets());
    }, [dispatch]);

    // 2. Tìm Active Ticket
    const activeTicket = tickets.find(t => t.status !== 'closed');

    // 3. Load Messages
    useEffect(() => {
        if (activeTicket) {
            dispatch(fetchMessages(activeTicket.id));
        }
    }, [dispatch, activeTicket]);

    // 4. Realtime Listener
    useEffect(() => {
        if (activeTicket) {
            const channel = echo.channel(`ticket.${activeTicket.id}`);
            channel.listen('.MessageSent', (e) => {
                if (e.message.sender_id !== user.id) {
                    dispatch(addRealtimeMessage(e.message));
                }
            });
            return () => echo.leave(`ticket.${activeTicket.id}`);
        }
    }, [activeTicket, dispatch, user?.id]);

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeTicket, selectedFile, previewUrl]); // Scroll khi có ảnh preview

    // --- XỬ LÝ EMOJI ---
    const onEmojiClick = (emojiObject) => {
        setMsgContent(prev => prev + emojiObject.emoji);
        // Không đóng bảng emoji ngay để user có thể chọn nhiều icon
    };

    // --- XỬ LÝ FILE/ẢNH ---
    const handleFileSelect = (file) => {
        // Lưu file gốc để gửi đi
        setSelectedFile(file);

        // Tạo URL preview nếu là ảnh
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null); // Là file thường (pdf, doc...)
        }
        return false; // Chặn auto upload của Antd
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl); // Xóa URL khỏi bộ nhớ
            setPreviewUrl(null);
        }
    };

    // --- GỬI TIN NHẮN ---
    const handleSend = async () => {
        if (!msgContent.trim() && !selectedFile) return;
        
        // Gửi object thuần, Service sẽ tự convert sang FormData
        const payload = {
            ticket_id: activeTicket.id,
            message: msgContent,
            file: selectedFile 
        };
        
        await dispatch(sendMessage(payload));
        
        // Reset form
        setMsgContent("");
        removeFile(); 
        setShowEmoji(false);
    };

    const currentMessages = activeTicket ? (messages[activeTicket.id] || []) : [];

    return (
        <div className="h-[calc(100vh-64px)] mt-16 bg-gray-100 flex justify-center py-6 px-4">
            <Card 
                className="w-full max-w-2xl h-full shadow-lg rounded-xl overflow-hidden border-0 flex flex-col"
                bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
            >
                {/* === HEADER === */}
                <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar size={44} icon={<CustomerServiceOutlined />} className="bg-blue-600" />
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-base m-0">Chăm sóc khách hàng</h3>
                            <span className="text-xs text-gray-500">Thường phản hồi trong vài phút</span>
                        </div>
                    </div>
                    {activeTicket && (
                        <Tag color="processing" className="border-0 bg-blue-50 text-blue-600 rounded-full px-3">
                            #{activeTicket.id}
                        </Tag>
                    )}
                </div>

                {/* === BODY === */}
                <div className="flex-1 bg-[#f5f6fa] overflow-hidden relative flex flex-col">
                    
                    {activeTicket ? (
                        <>
                            {/* Context Bar */}
                            {contextOrderId && (
                                <div className="bg-blue-50 px-4 py-2 text-xs text-blue-700 flex justify-center border-b border-blue-100">
                                    Đang hỗ trợ cho đơn hàng #{contextOrderId}
                                </div>
                            )}

                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {currentMessages.map((msg) => {
                                    const isMe = msg.sender_type === 'user';
                                    
                                    return (
                                        <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                            <div className={`flex max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                                                
                                                {!isMe && (
                                                    <Avatar size="small" icon={<CustomerServiceOutlined />} className="bg-orange-500 flex-shrink-0" />
                                                )}

                                                <div className="flex flex-col gap-1">
                                                    <div className={`px-4 py-2 text-[15px] shadow-sm whitespace-pre-wrap ${
                                                        isMe 
                                                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' 
                                                        : 'bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-100'
                                                    }`}>
                                                        {/* Text Content */}
                                                        {msg.message}
                                                        
                                                        {/* Image/File Content */}
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
                                                                        <PaperClipOutlined /> Tải file đính kèm
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className={`text-[10px] text-gray-400 ${isMe ? 'text-right' : 'text-left'}`}>
                                                        {dayjs(msg.created_at).format("HH:mm")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* --- INPUT BAR & PREVIEW --- */}
                            <div className="bg-white border-t border-gray-200">
                                
                                {/* 1. Khu vực Preview Ảnh/File trước khi gửi */}
                                {selectedFile && (
                                    <div className="px-4 pt-3 pb-1 flex items-center">
                                        <div className="relative bg-gray-100 rounded-lg p-2 border border-gray-200 inline-flex items-center gap-3">
                                            {/* Nút xóa */}
                                            <div 
                                                onClick={removeFile}
                                                className="absolute -top-2 -right-2 bg-white rounded-full cursor-pointer hover:scale-110 transition-transform shadow-sm"
                                            >
                                                <CloseCircleFilled className="text-red-500 text-lg" />
                                            </div>

                                            {previewUrl ? (
                                                <Image src={previewUrl} width={60} height={60} className="rounded-md object-cover" preview={false} />
                                            ) : (
                                                <FileTextOutlined className="text-3xl text-blue-500 mx-2" />
                                            )}
                                            
                                            <div className="max-w-[150px] overflow-hidden">
                                                <div className="text-xs font-semibold truncate">{selectedFile.name}</div>
                                                <div className="text-[10px] text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 2. Thanh công cụ nhập liệu */}
                                <div className="p-3 flex items-end gap-2">
                                    {/* Nút Upload Ảnh */}
                                    <Upload 
                                        beforeUpload={handleFileSelect} 
                                        showUploadList={false} 
                                        maxCount={1}
                                        accept="image/*,.pdf,.doc,.docx" // Giới hạn loại file
                                    >
                                        <Button type="text" shape="circle" icon={<PaperClipOutlined className="text-xl text-gray-500" />} />
                                    </Upload>

                                    {/* Input Text */}
                                    <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 flex items-center relative">
                                        <TextArea 
                                            value={msgContent}
                                            onChange={(e) => setMsgContent(e.target.value)}
                                            placeholder="Nhập tin nhắn..." 
                                            autoSize={{ minRows: 1, maxRows: 4 }}
                                            className="bg-transparent border-none shadow-none focus:shadow-none text-sm p-0 resize-none w-full"
                                            onPressEnter={(e) => {
                                                if(!e.shiftKey) { e.preventDefault(); handleSend(); }
                                            }}
                                        />
                                        
                                        {/* Nút Emoji */}
                                        <Popover 
                                            content={
                                                <EmojiPicker 
                                                    onEmojiClick={onEmojiClick} 
                                                    width={300} 
                                                    height={400} 
                                                    searchDisabled={true} // Tắt tìm kiếm cho gọn
                                                    skinTonesDisabled={true}
                                                />
                                            } 
                                            title="Biểu tượng cảm xúc" 
                                            trigger="click"
                                            open={showEmoji}
                                            onOpenChange={(newOpen) => setShowEmoji(newOpen)}
                                            placement="topLeft"
                                        >
                                            <Button 
                                                type="text" 
                                                shape="circle" 
                                                icon={<SmileOutlined className="text-xl text-gray-500 hover:text-orange-500 transition-colors" />} 
                                                className="ml-2"
                                            />
                                        </Popover>
                                    </div>

                                    {/* Nút Gửi */}
                                    <Button 
                                        type="primary" 
                                        shape="circle" 
                                        size="large"
                                        icon={<SendOutlined />} 
                                        onClick={handleSend} 
                                        className={`${(msgContent.trim() || selectedFile) ? 'bg-blue-600 shadow-md' : 'bg-gray-300 shadow-none'} border-none transition-all`}
                                        disabled={!msgContent.trim() && !selectedFile}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        // Màn hình chờ
                        <div className="h-full flex flex-col justify-center items-center p-8 text-center">
                            <Empty 
                                image={<CustomerServiceOutlined className="text-6xl text-blue-100" />}
                                description={false} 
                            />
                            <h3 className="text-lg font-bold text-gray-700 mt-4">Kết nối với hỗ trợ viên</h3>
                            <p className="text-gray-500 text-sm mb-6 max-w-xs">
                                Chúng tôi sẵn sàng giải đáp mọi thắc mắc của bạn về đơn hàng và sản phẩm.
                            </p>
                           
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default UserSupportPage;