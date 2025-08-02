import { useRef, useState } from 'react';
import { Button, Card, Typography, Tag, message } from 'antd';

const { Title, Text } = Typography;

interface Props {
  targetWord: string;
}
type SpeechRecognitionEvent = Event & {
  results: SpeechRecognitionResultList;
};

const PronunciationPractice = ({ targetWord }: Props) => {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState('');
  const recognitionRef = useRef<any>(null);

  const handleStart = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      message.error('Trình duyệt không hỗ trợ ghi âm!');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.trim();
      setResult(transcript);
      if (transcript === targetWord) {
        message.success('✅ Phát âm chính xác!');
      } else {
        message.warning(`❌ Bạn phát âm "${transcript}", cần "${targetWord}"`);
      }
      setIsRecording(false);
    };

    recognition.onerror = () => {
      message.error('Lỗi khi nhận diện giọng nói.');
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const handleStop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  return (
    <Card title="Luyện phát âm" style={{ marginTop: 24 }}>
      <Title level={4}>Từ: <Text code>{targetWord}</Text></Title>
      <Button type={isRecording ? 'default' : 'primary'} onClick={isRecording ? handleStop : handleStart}>
        {isRecording ? '⏹ Dừng ghi âm' : '🎙 Bắt đầu ghi âm'}
      </Button>
      {result && (
        <div style={{ marginTop: 16 }}>
          <Text>Kết quả bạn nói:</Text>{' '}
          <Tag color={result === targetWord ? 'green' : 'red'}>{result}</Tag>
        </div>
      )}
    </Card>
  );
};

export default PronunciationPractice;
