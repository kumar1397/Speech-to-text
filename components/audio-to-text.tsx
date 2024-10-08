"use client";
import React, { useState, useEffect, useRef } from 'react';

const SpeechToText = () => {
  const [transcript, setTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      setRecognition(recognitionInstance);

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        setTranscript(event.results[0][0].transcript);
      };
    }
  }, []);

  const startRecording = async () => {
    setIsRecording(true);
    recognition?.start();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    let chunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      chunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/wav' });
      setAudioBlob(blob);
    };

    mediaRecorder.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognition?.stop();
    mediaRecorderRef.current?.stop();
  };

  const saveRecording = async () => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append('transcript', transcript);
    formData.append('audio', audioBlob);

    await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
  };

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <p>{transcript}</p>
      {audioBlob && (
        <button onClick={saveRecording}>
          Save Recording
        </button>
      )}
    </div>
  );
};

export default SpeechToText;
