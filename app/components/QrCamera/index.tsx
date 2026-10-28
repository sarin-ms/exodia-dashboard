"use client";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Camera, LoaderCircle, ScanLine } from "lucide-react";
import styles from "./QrCamera.module.css";
export default function QrCamera({
  active,
  onDecode,
  onError,
}: {
  active: boolean;
  onDecode: (value: string) => void;
  onError: (message: string) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [starting, setStarting] = useState(true);
  const decoded = useEffectEvent(onDecode),
    failed = useEffectEvent(onError);
  useEffect(() => {
    if (!active) return;
    const element = video.current;
    let cancelled = false,
      stream: MediaStream | null = null,
      timer: ReturnType<typeof setTimeout> | undefined;
    async function start() {
      try {
        const { default: jsQR } = await import("jsqr");
        if (cancelled) return;
        setStarting(true);
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia)
          throw new Error(
            "Camera scanning needs HTTPS or localhost. Use manual entry below.",
          );
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelled || !element) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        element.srcObject = stream;
        await element.play();
        if (cancelled) return;
        setStarting(false);
        const canvas = document.createElement("canvas"),
          context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context)
          throw new Error(
            "Camera preview unavailable. Use manual entry below.",
          );
        const scan = () => {
          if (cancelled || !element) return;
          if (element.readyState >= 2 && element.videoWidth) {
            const ratio = Math.min(1, 900 / element.videoWidth);
            canvas.width = Math.round(element.videoWidth * ratio);
            canvas.height = Math.round(element.videoHeight * ratio);
            context.drawImage(element, 0, 0, canvas.width, canvas.height);
            const frame = context.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            );
            const code = jsQR(frame.data, frame.width, frame.height, {
              inversionAttempts: "attemptBoth",
            });
            if (code?.data) {
              stream?.getTracks().forEach((track) => track.stop());
              decoded(code.data);
              return;
            }
          }
          timer = setTimeout(scan, 240);
        };
        scan();
      } catch (cause) {
        stream?.getTracks().forEach((track) => track.stop());
        if (cancelled) return;
        setStarting(false);
        failed(
          cause instanceof DOMException
            ? cause.name === "NotAllowedError"
              ? "Camera access was denied. You can enter the ticket manually."
              : cause.name === "NotFoundError"
                ? "No camera was found. Enter the ticket manually."
                : "Camera unavailable. Close other camera apps or use manual entry."
            : cause instanceof Error
              ? cause.message
              : "Camera unavailable. Use manual entry.",
        );
      }
    }
    void start();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
      if (element) element.srcObject = null;
    };
  }, [active]);
  return (
    <div className={styles.stage}>
      <video
        ref={video}
        autoPlay
        playsInline
        muted
        aria-label="Ticket QR camera preview"
      />
      {!active && (
        <div className={styles.placeholder}>
          <div>
            <ScanLine size={49} strokeWidth={1} />
          </div>
          <strong>A great welcome starts here.</strong>
          <p>
            Position the attendee’s ticket QR
            <br />
            inside the frame to get started.
          </p>
        </div>
      )}
      {active && (
        <div className={styles.guide} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
      )}
      {active && starting && (
        <div className={styles.loading} role="status">
          <LoaderCircle size={23} />
          Opening camera…
        </div>
      )}
      <div className={styles.cameraFooter}>
        <Camera size={13} />
        <span>{active ? "Scanning for a ticket QR" : "Camera is off"}</span>
        <i />
      </div>
    </div>
  );
}
