"""Extract audio from a video file using ffmpeg."""

import subprocess
from pathlib import Path


class AudioExtractor:
    """Extracts the audio track from a video file as MP3."""

    def extract(self, video_path: Path, output_dir: Path) -> Path:
        """Extract audio from *video_path* into *output_dir*.

        Returns the path to the resulting MP3 file.
        Raises RuntimeError if ffmpeg fails.
        """
        output_dir.mkdir(parents=True, exist_ok=True)
        audio_path = output_dir / f"{video_path.stem}.mp3"

        result = subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i", str(video_path),
                "-vn",
                "-acodec", "libmp3lame",
                "-q:a", "4",
                str(audio_path),
            ],
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            raise RuntimeError(
                f"ffmpeg audio extraction failed:\n{result.stderr}"
            )

        return audio_path
