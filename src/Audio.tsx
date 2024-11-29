import React, { useState, useRef } from 'react';
import axios from 'axios';

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Not Recording');
  const [apiResponse, setApiResponse] = useState<Record<string, any> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
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

  const sendAudioToAPI = async (audioBlob: Blob) => {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBytes = Array.from(new Uint8Array(arrayBuffer));

      // API Call
      const response = await axios.post(
        'https://my-app.dhruvmaurya298.workers.dev/process-audio',
        { audio: audioBytes }
      );

      console.log('API Response:', response.data);
      setApiResponse(response.data); // Save the entire response object
      setStatus('Audio processed successfully!');
    } catch (error) {
      console.error('Error sending audio to API:', error);
      setStatus('Failed to process audio.');
      setApiResponse({ error: 'Could not process audio.' }); // Set error response
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Audio Recorder</h1>
      <div style={styles.buttonContainer}>
        <button
          onClick={startRecording}
          disabled={isRecording}
          style={{
            ...styles.button,
            backgroundColor: isRecording ? '#d3d3d3' : '#4CAF50',
          }}
        >
          Start Recording
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          style={{
            ...styles.button,
            backgroundColor: !isRecording ? '#d3d3d3' : '#F44336',
          }}
        >
          Stop Recording
        </button>
      </div>
      <p style={styles.status}>{`Status: ${status}`}</p>
      {apiResponse && (
        <div style={styles.responseContainer}>
          <h3 style={styles.responseTitle}>API Response:</h3>
          <pre style={styles.responseText}>
            {JSON.stringify(apiResponse, null, 2)} {/* Pretty-print object */}
          </pre>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    textAlign: 'center',
    margin: '50px auto',
    maxWidth: '600px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  status: {
    marginTop: '20px',
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#555',
  },
  responseContainer: {
    marginTop: '30px',
    textAlign: 'left',
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  responseTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#444',
  },
  responseText: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#666',
    maxHeight: '200px', // Set max height for the container
    overflowY: 'auto', // Enable vertical scrolling if content overflows
    wordWrap: 'break-word', // Break long words for better readability
  },
};

export default AudioRecorder;
