import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, StopCircle, PlayCircle, Upload, CheckCircle } from "lucide-react";

interface VideoRecorderProps {
  onVideoRecorded: (videoBlob: Blob) => void;
  onSubmitInterview?: () => void;
  isSubmitting?: boolean;
  isDemoMode?: boolean;
}

export const VideoRecorder = forwardRef<
  { startRecording: () => void; stopRecording: () => void },
  VideoRecorderProps
>(({ onVideoRecorded, onSubmitInterview, isSubmitting, isDemoMode }, ref) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useImperativeHandle(ref, () => ({
    startRecording: handleStartRecording,
    stopRecording: handleStopRecording,
  }));

  const handleStartRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: true
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Check for supported MIME types
      let options = {};
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        options = { mimeType: 'video/webm;codecs=vp8,opus' };
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        options = { mimeType: 'video/webm' };
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        options = { mimeType: 'video/mp4' };
      }

      const mediaRecorder = new MediaRecorder(mediaStream, options);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        
        setRecordedVideoUrl(videoUrl);
        setHasVideo(true);
        onVideoRecorded(videoBlob);
        
        // Stop the media stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not start recording. Please check your camera permissions.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {hasVideo && recordedVideoUrl ? (
          <video
            src={recordedVideoUrl}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        )}
        
        {!isRecording && !hasVideo && !stream && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Camera size={48} className="mx-auto mb-4 opacity-75" />
              <p className="text-lg">Camera Preview</p>
              <p className="text-sm opacity-75">Click "Start Recording" to begin</p>
            </div>
          </div>
        )}

        {isRecording && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">REC</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-4">
        {!isRecording && !hasVideo && (
          <Button onClick={handleStartRecording} size="lg">
            <PlayCircle className="mr-2 h-5 w-5" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <Button onClick={handleStopRecording} variant="destructive" size="lg">
            <StopCircle className="mr-2 h-5 w-5" />
            Stop Recording
          </Button>
        )}

        {hasVideo && (
          <div className="text-center space-y-4">
            <div className="text-green-600">
              <CheckCircle className="mx-auto h-8 w-8 mb-2" />
              <p>Recording completed successfully!</p>
              {isDemoMode && <p className="text-sm text-gray-500 mt-1">This is a demo - no actual data will be saved</p>}
            </div>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={onSubmitInterview}
                disabled={isSubmitting}
                size="lg"
              >
                <Upload className="mr-2 h-5 w-5" />
                {isSubmitting ? "Submitting..." : isDemoMode ? "Complete Demo" : "Submit Interview"}
              </Button>
              <Button onClick={() => {
                setHasVideo(false);
                setRecordedVideoUrl(null);
                chunksRef.current = [];
              }} variant="outline" size="lg">
                Record Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

VideoRecorder.displayName = "VideoRecorder";
