// Sign-Kit API Service (Port 5000)
export const SIGNKIT_API = process.env.REACT_APP_SIGNKIT_API || 'http://localhost:5000';

// Technothon API Service (Port 8000)
export const TECHNOTHON_API = process.env.REACT_APP_TECHNOTHON_API || 'http://localhost:8080';

// ============================================
// SIGN-KIT API CALLS
// ============================================

export const signKitSpeechToText = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    const response = await fetch(`${SIGNKIT_API}/api/speech-to-text`, {
        method: 'POST',
        body: formData
    });
    if (!response.ok) throw new Error('Speech to Text failed');
    return await response.json();
};

export const signKitTranslateToEnglish = async (text, fromLang) => {
    const response = await fetch(`${SIGNKIT_API}/api/translate-to-english`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, from: fromLang })
    });
    if (!response.ok) throw new Error('Translation failed');
    return await response.json();
};

export const signKitTextToSpeech = async (text, lang) => {
    const response = await fetch(`${SIGNKIT_API}/api/text-to-speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang })
    });
    if (!response.ok) throw new Error('Text to Speech failed');
    return await response.json();
};

// ============================================
// TECHNOTHON API CALLS
// ============================================

export const pollTechnothonWord = async () => {
    const response = await fetch(`${TECHNOTHON_API}/word`);
    if (!response.ok) throw new Error('Failed to fetch word');
    return await response.json();
};

export const clearTechnothonQueue = async () => {
    const response = await fetch(`${TECHNOTHON_API}/clear`);
    if (!response.ok) throw new Error('Failed to clear queue');
    return await response.json();
};

export const technothonTranslate = async (text, targetLang) => {
    const response = await fetch(`${TECHNOTHON_API}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target: targetLang })
    });
    if (!response.ok) throw new Error('Translation failed');
    return await response.json();
};

export const technothonSpeak = async (text, targetLang) => {
    const response = await fetch(`${TECHNOTHON_API}/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target: targetLang })
    });
    if (!response.ok) throw new Error('TTS failed');
    return await response.blob();
};

