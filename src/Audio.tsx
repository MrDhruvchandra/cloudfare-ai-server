import React, { useState, useRef } from 'react';
import axios from 'axios';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Not Recording');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        audioChunksRef.current = []; // Reset chunks
        await sendAudioToAPI(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatus('Recording...');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('Processing...');
    }
  };

  const sendAudioToAPI = async (audioBlob) => {
    try {
      // Convert Blob to ArrayBuffer and then Uint8Array
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBytes = Array.from(new Uint8Array(arrayBuffer));

      // API Call
      const response = await axios.post(' https://my-app.dhruvmaurya298.workers.dev/process-audio', {
        audio: audioBytes,
      });

      console.log('API Response:', response.data);
      setStatus('Audio processed successfully!');
    } catch (error) {
      console.error('Error sending audio to API:', error);
      setStatus('Failed to process audio.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Audio Recorder</h1>
      <button
        onClick={startRecording}
        disabled={isRecording}
        style={{ padding: '10px 20px', margin: '10px', fontSize: '16px' }}
      >
        Start Recording
      </button>
      <button
        onClick={stopRecording}
        disabled={!isRecording}
        style={{ padding: '10px 20px', margin: '10px', fontSize: '16px' }}
      >
        Stop Recording
      </button>
      <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{`Status: ${status}`}</p>
    </div>
  );
};

export default AudioRecorder;
