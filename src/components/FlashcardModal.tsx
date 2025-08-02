import { Modal, Button, Typography, Progress, Space, Divider } from "antd";
import { useState, useEffect } from "react";
import { Flashcard } from "../types/flashcard";
import { reviewFlashcard } from "../api/flashcardApi";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

interface FlashcardModalProps {
  open: boolean;
  onClose: () => void;
  flashcards: Flashcard[];
  onFinish: () => void;
}

const FlashcardModal = ({
  open,
  onClose,
  flashcards,
  onFinish,
}: FlashcardModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state khi modal được mở lại với bộ thẻ mới
  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsSubmitting(false);
    }
  }, [open, flashcards]);

  const handleReview = async (quality: number) => {
    const currentFlashcard = flashcards[currentIndex];
    if (!currentFlashcard || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Gọi API để cập nhật kết quả review với điểm quality
      await reviewFlashcard(currentFlashcard._id, quality);
    } catch (error) {
      toast.error("Lỗi khi cập nhật kết quả review!");
    } finally {
      setIsSubmitting(false);
    }

    // Chuyển sang thẻ tiếp theo hoặc kết thúc
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false); // Lật lại mặt trước cho thẻ mới
    } else {
      onFinish(); // Hoàn thành phiên ôn tập
    }
  };

  const currentFlashcard = flashcards[currentIndex];
  const progressPercent = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;

  if (!currentFlashcard) {
    return null; // Không render gì nếu không có thẻ
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Ôn tập Flashcards"
      footer={null} // Tự custom footer bên trong
      width={600}
    >
      <div style={{ textAlign: "center", minHeight: 350, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <Progress percent={progressPercent} showInfo={false} />
          <Text type="secondary" style={{ marginBottom: 20, display: 'block' }}>
            Thẻ {currentIndex + 1} / {flashcards.length}
          </Text>

          {/* Phần hiển thị nội dung thẻ */}
          <div style={{
            minHeight: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: 20
          }}>
            {!isFlipped ? (
              // Mặt trước thẻ: Nghĩa tiếng Việt
              <>
                <Text style={{ fontSize: 18, marginBottom: 10 }}>Nghĩa là gì?</Text>
                <Title level={2} style={{ margin: 0 }}>{currentFlashcard.vietnamese}</Title>
              </>
            ) : (
              // Mặt sau thẻ: Đáp án
              <>
                <Title level={1} style={{ margin: 0, fontFamily: 'KaiTi, serif' }}>{currentFlashcard.chinese}</Title>
                <Text style={{ fontSize: 24, color: '#888' }}>{currentFlashcard.pinyin}</Text>
                <Text style={{ fontSize: 18, marginTop: 8 }}>{currentFlashcard.hanViet}</Text>
              </>
            )}
          </div>
        </div>

        {/* Phần nút bấm điều khiển */}
        <div style={{ marginTop: 24 }}>
          {!isFlipped ? (
            <Button type="primary" size="large" onClick={() => setIsFlipped(true)} block>
              Lật thẻ xem đáp án
            </Button>
          ) : (
            <div>
                <Divider><Text type="secondary">Bạn nhớ từ này ở mức độ nào?</Text></Divider>
                <Space style={{ width: '100%' }} size="middle">
                    <Button
                        danger
                        size="large"
                        onClick={() => handleReview(1)} // quality = 1: Khó, gần như quên
                        style={{ flex: 1 }}
                        loading={isSubmitting}
                    >
                        Quên
                    </Button>
                    <Button
                        size="large"
                        onClick={() => handleReview(3)} // quality = 3: Nhớ ra nhưng hơi khó khăn
                        style={{ flex: 1 }}
                        loading={isSubmitting}
                    >
                        Khó
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        onClick={() => handleReview(4)} // quality = 4: Nhớ tốt
                        style={{ flex: 1 }}
                        loading={isSubmitting}
                    >
                        Tốt
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        onClick={() => handleReview(5)} // quality = 5: Rất dễ
                        style={{ flex: 1, background: '#52c41a', borderColor: '#52c41a' }}
                        loading={isSubmitting}
                    >
                        Dễ
                    </Button>
                </Space>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FlashcardModal;
