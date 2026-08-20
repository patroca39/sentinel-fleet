import {
  ALL_FORMATS,
  Input,
  UrlSource,
  VideoSample,
  VideoSampleSink,
} from "mediabunny";

/**
 * Extracts frames from a video source at specific timestamps.
 * 
 * @param {Object} props
 * @param {string} props.src - The URL/source path of the video.
 * @param {number[]|Function} props.timestampsInSeconds - List of timestamps or a function that returns them.
 * @param {Function} props.onVideoSample - Callback called for each extracted VideoSample.
 * @param {AbortSignal} [props.signal] - Optional abort signal for cancellation.
 * @returns {Promise<void>}
 */
export async function extractFrames({
  src,
  timestampsInSeconds,
  onVideoSample,
  signal,
}) {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(src),
  });

  try {
    const [durationInSeconds, format, videoTrack] = await Promise.all([
      input.computeDuration(),
      input.getFormat(),
      input.getPrimaryVideoTrack(),
    ]);

    if (!videoTrack) {
      throw new Error("No video track found in the input");
    }

    if (signal?.aborted) {
      throw new Error("Aborted");
    }

    const timestamps =
      typeof timestampsInSeconds === "function"
        ? await timestampsInSeconds({
            track: {
              width: videoTrack.displayWidth,
              height: videoTrack.displayHeight,
            },
            container: format.name,
            durationInSeconds,
          })
        : timestampsInSeconds;

    if (timestamps.length === 0) {
      return;
    }

    if (signal?.aborted) {
      throw new Error("Aborted");
    }

    const sink = new VideoSampleSink(videoTrack);

    for await (const videoSample of sink.samplesAtTimestamps(timestamps)) {
      if (signal?.aborted) {
        if (videoSample && typeof videoSample[Symbol.dispose] === "function") {
          videoSample[Symbol.dispose]();
        }
        break;
      }

      if (!videoSample) {
        continue;
      }

      try {
        onVideoSample(videoSample);
      } finally {
        if (typeof videoSample[Symbol.dispose] === "function") {
          videoSample[Symbol.dispose]();
        }
      }
    }
  } finally {
    if (input && typeof input[Symbol.dispose] === "function") {
      input[Symbol.dispose]();
    }
  }
}
