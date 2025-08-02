import { useState } from "react";
import { Flashcard } from "../types/flashcard";
import { updateReviewResult } from "../api/flashcardApi";
import { Button, Card, Col, message, Modal, Progress, Row, Space, Statistic } from "antd";
import {SoundOutlined, CloseOutlined, CheckOutlined, EyeOutlined } from '@ant-design/icons';



interface FlashcardModalProps {
    open: boolean;
    onClose: () => void;
    flashcards: Flashcard[];
    onFinish: () => void;
}

const FlashcardModal: React.FC<FlashcardModalProps> = ({ open, onClose, flashcards, onFinish }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ correct: 0, total: 0 });

    const currentCard = flashcards[currentIndex];

    const handleAnswer = async (isCorrect: boolean) => {
        if (!currentCard) return;

        setLoading(true);
        try {
            await updateReviewResult(currentCard._id, isCorrect);
            setStats(prev => ({
                correct: prev.correct + (isCorrect ? 1 : 0),
                total: prev.total + 1
            }));

            if (currentIndex < flashcards.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setShowAnswer(false);
            } else {
                message.success(`Hoàn thành! Điểm: ${stats.correct + (isCorrect ? 1 : 0)}/${flashcards.length}`);
                onFinish();
            }
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        }
        setLoading(false);
    };

    const speakChinese = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            window.speechSynthesis.speak(utterance);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return '#52c41a';
            case 'medium': return '#faad14';
            case 'hard': return '#f5222d';
            default: return '#1890ff';
        }
    };

    const getDifficultyText = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'Dễ';
            case 'medium': return 'Trung bình';
            case 'hard': return 'Khó';
            default: return 'Chưa xác định';
        }
    };

    if (!currentCard) {
        return (
            <Modal
                open={open}
                title="🎯 Flashcards"
                onCancel={onClose}
                footer={null}
                width={600}
            >
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2>Không có flashcards cần review!</h2>
                    <p>Bạn đã hoàn thành tất cả flashcards hoặc chưa có flashcards nào.</p>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            open={open}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    🎯 Flashcards Review
                    <span style={{
                        fontSize: 12,
                        color: '#666',
                        marginLeft: 'auto'
                    }}>
                        {currentIndex + 1}/{flashcards.length}
                    </span>
                </div>
            }
            onCancel={onClose}
            footer={null}
            width={700}
            centered
        >
            <div style={{ padding: '20px 0' }}>
                {/* Progress */}
                <Progress
                    percent={((currentIndex + 1) / flashcards.length) * 100}
                    status="active"
                    style={{ marginBottom: 24 }}
                />

                {/* Stats */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={8}>
                        <Statistic title="Đúng" value={stats.correct} valueStyle={{ color: '#52c41a' }} />
                    </Col>
                    <Col span={8}>
                        <Statistic title="Sai" value={stats.total - stats.correct} valueStyle={{ color: '#f5222d' }} />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Độ chính xác"
                            value={stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}
                            suffix="%"
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Col>
                </Row>

                {/* Flashcard */}
                <Card
                    style={{
                        marginBottom: 24,
                        border: '2px solid #e9ecef',
                        borderRadius: 16,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    bodyStyle={{ padding: '40px', textAlign: 'center' }}
                >
                    {/* Chinese Character */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{
                            fontSize: 48,
                            fontWeight: 'bold',
                            marginBottom: 16,
                            color: '#262626'
                        }}>
                            {currentCard.chinese}
                        </div>
                        <Space>
                            <Button
                                type="text"
                                icon={<SoundOutlined />}
                                onClick={() => speakChinese(currentCard.chinese)}
                                style={{ color: '#1890ff' }}
                            >
                                Phát âm
                            </Button>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: 12,
                                fontSize: 12,
                                fontWeight: 600,
                                color: 'white',
                                backgroundColor: getDifficultyColor(currentCard.difficulty)
                            }}>
                                {getDifficultyText(currentCard.difficulty)}
                            </span>
                        </Space>
                    </div>

                    {/* Answer Section */}
                    {showAnswer ? (
                        <div style={{
                            background: '#f8f9fa',
                            padding: '24px',
                            borderRadius: 12,
                            border: '1px solid #e9ecef'
                        }}>
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                                    Hán Việt: {currentCard.hanViet}
                                </div>
                                <div style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>
                                    Pinyin: {currentCard.pinyin}
                                </div>
                                <div style={{ fontSize: 18, fontWeight: 600, color: '#1890ff' }}>
                                    Nghĩa: {currentCard.vietnamese}
                                </div>
                            </div>

                            <div style={{
                                fontSize: 12,
                                color: '#666',
                                marginBottom: 16
                            }}>
                                Đã review: {currentCard.reviewCount} lần |
                                Đúng: {currentCard.correctCount} lần
                            </div>

                            {/* Answer Buttons */}
                            <Space size="large">
                                <Button
                                    type="primary"
                                    danger
                                    size="large"
                                    icon={<CloseOutlined />}
                                    onClick={() => handleAnswer(false)}
                                    loading={loading}
                                    style={{
                                        height: 48,
                                        padding: '0 32px',
                                        fontSize: 16,
                                        fontWeight: 600
                                    }}
                                >
                                    Sai
                                </Button>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<CheckOutlined />}
                                    onClick={() => handleAnswer(true)}
                                    loading={loading}
                                    style={{
                                        height: 48,
                                        padding: '0 32px',
                                        fontSize: 16,
                                        fontWeight: 600,
                                        background: '#52c41a',
                                        borderColor: '#52c41a'
                                    }}
                                >
                                    Đúng
                                </Button>
                            </Space>
                        </div>
                    ) : (
                        <div>
                            <Button
                                type="primary"
                                size="large"
                                icon={<EyeOutlined />}
                                onClick={() => setShowAnswer(true)}
                                style={{
                                    height: 48,
                                    padding: '0 32px',
                                    fontSize: 16,
                                    fontWeight: 600
                                }}
                            >
                                Xem đáp án
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </Modal>
    );
};

export default FlashcardModal; 