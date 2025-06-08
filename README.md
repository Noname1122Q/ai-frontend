# 🎙️ Podcast Clipper

> An AI-powered tool to transform long podcast videos into short, engaging clips — complete with smart cropping, subtitle overlays, and seamless GCS integration.

---

## 🚀 Features

- 🎯 **AI-Powered Clipping**: Automatically identifies meaningful segments from lengthy podcasts.
- 🧠 **WhisperX-Driven Transcripts**: Generates accurate subtitles with precise timestamps.
- 🎥 **Face-Aware Cropping**: Dynamically adjusts framing based on detected faces.
- ☁️ **Cloud Storage Support**: Integrated with Google Cloud Storage for video input/output.
- 🧱 **Step-by-Step Processing**: Built-in event-driven workflows using [Inngest].
- 🖥️ **Sleek Frontend**: Built with Next.js, TailwindCSS, and ShadCN UI.

---

## 🛠️ Tech Stack

**Backend**

- Python
- WhisperX
- FFmpeg
- TQDM, pathlib, subprocess
- Modal (for hosting and job execution)

**Frontend**

- Next.js (App Router)
- TailwindCSS, ShadCN UI
- Inngest (event orchestration)
- Next-Auth

**Infrastructure**

- Google Cloud Storage (GCS)

---

## 🧪 How It Works

1. Upload your long-form podcast video to GCS.
2. Inngest triggers the processing pipeline via Modal.
3. The Python backend:
   - Extracts audio & frames
   - Generates transcripts via WhisperX
   - Detects faces and adjusts cropping
   - Embeds subtitles and exports clips
4. Final clips are stored back in GCS.
5. Frontend reflects the clip status and previews.
