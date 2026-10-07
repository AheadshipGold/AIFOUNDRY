"use client";

import { useState, useRef, useEffect } from "react";

interface AudioDictationButtonProps {
  onTranscript: (text: string) => void;
  language?: "fr" | "en";
  buttonText?: string;
  className?: string;
  size?: "sm" | "md";
}

export function AudioDictationButton({
  onTranscript,
  language = "fr",
  buttonText,
  className = "",
  size = "md",
}: AudioDictationButtonProps) {
  const isFr = language === "fr";
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const accumulatedTextRef = useRef<string>("");

  const stopCleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  };

  useEffect(() => {
    return () => {
      stopCleanup();
    };
  }, []);

  const startDictation = async () => {
    setErrorMessage(null);
    accumulatedTextRef.current = "";
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          isFr
            ? "L'accès au microphone n'est pas supporté par votre navigateur."
            : "Microphone access is not supported by your browser."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // 1. Essai de reconnaissance vocale native du navigateur (Web Speech API)
      const SpeechRecognitionClass =
        typeof window !== "undefined"
          ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
          : null;

      let nativeStarted = false;

      if (SpeechRecognitionClass) {
        try {
          const recognition = new SpeechRecognitionClass();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = isFr ? "fr-FR" : "en-US";

          recognition.onresult = (event: any) => {
            let interim = "";
            let finalChunk = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalChunk += transcript + " ";
              } else {
                interim += transcript;
              }
            }

            if (finalChunk) {
              accumulatedTextRef.current += finalChunk;
            }

            const current = (accumulatedTextRef.current + interim).trim();
            if (current) {
              onTranscript(current);
            }
          };

          recognition.onerror = (event: any) => {
            console.warn("[WebSpeech] Info:", event.error);
          };

          recognition.start();
          recognitionRef.current = recognition;
          nativeStarted = true;
        } catch (recognitionErr) {
          console.warn("[WebSpeech] Web Speech indisponible:", recognitionErr);
        }
      }

      // 2. Enregistrement audio parallèle via MediaRecorder pour le backend API
      let mimeType = "audio/webm";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(250);
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= 60) {
            stopDictation();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error("[AudioDictation] Erreur d'accès micro:", err);
      setErrorMessage(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? isFr
            ? "Accès micro refusé. Veuillez autoriser le microphone."
            : "Microphone permission denied."
          : err.message || (isFr ? "Impossible d'accéder au micro." : "Unable to access mic.")
      );
    }
  };

  const stopDictation = async () => {
    if (!isRecording) return;

    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Si la reconnaissance vocale native a déjà capturé le texte, on est déjà servi
    const nativeText = accumulatedTextRef.current.trim();
    if (nativeText && nativeText.length > 2) {
      onTranscript(nativeText);
      return;
    }

    // Sinon, envoi au backend NestJS (/v1/ai/transcribe)
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 300));

    try {
      const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

      if (audioBlob.size > 500) {
        const formData = new FormData();
        formData.append("file", audioBlob, "voice-input.webm");
        formData.append("language", language);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        const res = await fetch(`${apiUrl}/v1/ai/transcribe`, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.text) {
            onTranscript(data.text);
          }
        }
      }
    } catch (err: any) {
      console.warn("[AudioDictation] Fallback transcription:", err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {!isRecording ? (
        <button
          type="button"
          onClick={startDictation}
          disabled={isProcessing}
          title={isFr ? "Dicter vocalement avec le micro" : "Dictate with microphone"}
          className={`inline-flex items-center gap-2 rounded-xl border border-[var(--oj-color-border,#E2D9CC)] bg-[var(--oj-color-surface-subtle,#F2ECE1)] px-3 py-1.5 text-xs font-semibold text-[var(--oj-color-text-primary,#1C2421)] transition-all hover:border-[var(--oj-color-accent,#C49A45)] hover:bg-[var(--oj-color-surface-elevated,#FFFFFF)] disabled:opacity-50 ${
            size === "sm" ? "px-2 py-1 text-[11px]" : ""
          }`}
        >
          {isProcessing ? (
            <svg
              className="h-3.5 w-3.5 animate-spin text-[var(--oj-color-accent,#C49A45)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
            </svg>
          ) : (
            <svg
              className="h-3.5 w-3.5 text-[var(--oj-color-accent,#C49A45)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          )}
          <span>
            {buttonText || (isProcessing ? (isFr ? "Transcription..." : "Transcribing...") : isFr ? "Dicter au micro" : "Voice Dictate")}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={stopDictation}
          className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-500/20"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600"></span>
          </span>
          <svg
            className="h-3.5 w-3.5 text-red-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
          <span>{isFr ? `Arrêter (${duration}s)` : `Stop (${duration}s)`}</span>
        </button>
      )}

      {errorMessage && (
        <span className="text-[11px] text-red-600">{errorMessage}</span>
      )}
    </div>
  );
}
