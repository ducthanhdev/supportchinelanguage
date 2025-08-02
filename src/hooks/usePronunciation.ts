import { useState, useEffect } from "react";

const usePronunciation = () => {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>("");
    const [speechRate, setSpeechRate] = useState(1);

    useEffect(() => {
        const loadVoices = () => {
            const allVoices = window.speechSynthesis.getVoices();
            const zhVoices = allVoices.filter(v => v.lang && v.lang.startsWith("zh"));
            setVoices(zhVoices);
            if (zhVoices.length > 0 && !selectedVoice) {
                // Set the default voice to the first Chinese voice found
                setSelectedVoice(zhVoices[0].name);
            }
        };

        // Load voices initially
        if (speechSynthesis.getVoices().length > 0) {
            loadVoices();
        } else {
            // If not yet loaded, wait for the 'onvoiceschanged' event
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [selectedVoice]);

    const speakChinese = (text: string) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "zh-CN"; 
            utterance.rate = speechRate;
            if (selectedVoice) {
                utterance.voice = voices.find(v => v.name === selectedVoice) || null;
            }
            window.speechSynthesis.speak(utterance);
        }
    };

    const getDisplayVoiceName = (voice: SpeechSynthesisVoice) => {
        return `${voice.name} (${voice.lang})`;
    };

    return {
        voices,
        selectedVoice,
        setSelectedVoice,
        speechRate,
        setSpeechRate,
        getDisplayVoiceName,
        speakChinese,
    };
};

export default usePronunciation;
