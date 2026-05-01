import { describe, expect, it } from 'vitest'
import { mapYtDlpFormats, mapYtDlpMetadataToAnalysisResult } from './youtube'

const formatsFixture = [
  {
    acodec: 'mp4a.40.2',
    ext: 'mp4',
    filesize: 125_829_120,
    format_id: '22',
    height: 720,
    protocol: 'https',
    vcodec: 'avc1.64001F',
  },
  {
    acodec: 'mp4a.40.2',
    ext: 'mp4',
    filesize: 41_943_040,
    format_id: '18',
    height: 360,
    protocol: 'https',
    vcodec: 'avc1.42001E',
  },
  {
    abr: 129,
    acodec: 'mp4a.40.2',
    ext: 'm4a',
    format_id: '140',
    protocol: 'https',
    vcodec: 'none',
  },
  {
    acodec: 'none',
    ext: 'mp4',
    format_id: '137',
    height: 1080,
    protocol: 'https',
    vcodec: 'avc1.640028',
  },
]

describe('youtube downloader mapping', () => {
  it('maps yt-dlp formats to user-facing download formats', () => {
    expect(mapYtDlpFormats(formatsFixture)).toEqual([
      { extension: 'mp4', id: '22', label: '720p MP4', type: 'video' },
      { extension: 'mp4', id: '18', label: '360p MP4', type: 'video' },
      { extension: 'm4a', id: '140', label: 'Audio 129kbps M4A', type: 'audio' },
    ])
  })

  it('maps yt-dlp metadata to an analysis result', () => {
    expect(
      mapYtDlpMetadataToAnalysisResult(
        {
          formats: formatsFixture,
          thumbnail: 'https://img.youtube.com/demo.jpg',
          title: 'Demo Video!',
        },
        'https://youtu.be/demo',
      ),
    ).toMatchObject({
      fileSize: '120 MB',
      filename: 'Demo_Video.mp4',
      platform: 'youtube',
      preview: 'https://img.youtube.com/demo.jpg',
      quality: '720p MP4',
      url: 'https://youtu.be/demo',
    })
  })
})
