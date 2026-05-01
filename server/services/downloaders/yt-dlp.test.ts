import { EventEmitter } from 'node:events'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { YtDlpDownloaderError, prepareYtDlpFormatDownload } from './yt-dlp'

const execFileMock = vi.hoisted(() => vi.fn())
const spawnMock = vi.hoisted(() => vi.fn())

vi.mock('node:child_process', () => ({
  execFile: execFileMock,
  spawn: spawnMock,
}))

const createProcessMock = () => {
  const process = new EventEmitter() as EventEmitter & {
    kill: ReturnType<typeof vi.fn>
    stderr: EventEmitter & { resume: ReturnType<typeof vi.fn> }
  }

  process.kill = vi.fn()
  process.stderr = Object.assign(new EventEmitter(), {
    resume: vi.fn(),
  })

  return process
}

const getOutputPath = (args: string[]) => {
  const outputPath = args[args.indexOf('-o') + 1]

  if (!outputPath) {
    throw new Error('Missing yt-dlp output path')
  }

  return outputPath
}

describe('yt-dlp download preparation', () => {
  beforeEach(() => {
    execFileMock.mockReset()
    spawnMock.mockReset()
  })

  it('downloads the selected format to a non-empty temporary file', async () => {
    spawnMock.mockImplementation((_executable: string, args: string[]) => {
      const process = createProcessMock()
      const outputPath = getOutputPath(args)

      queueMicrotask(() => {
        mkdirSync(dirname(outputPath), { recursive: true })
        writeFileSync(outputPath, 'video-bytes')
        process.emit('close', 0)
      })

      return process
    })

    const download = await prepareYtDlpFormatDownload('https://x.com/user/status/123', 'http-832')

    expect(download.size).toBe(11)
    expect(existsSync(download.filePath)).toBe(true)

    await download.cleanup()

    expect(existsSync(download.filePath)).toBe(false)
  })

  it('rejects empty yt-dlp outputs before exposing a browser download', async () => {
    spawnMock.mockImplementation((_executable: string, args: string[]) => {
      const process = createProcessMock()
      const outputPath = getOutputPath(args)

      queueMicrotask(() => {
        mkdirSync(dirname(outputPath), { recursive: true })
        writeFileSync(outputPath, '')
        process.emit('close', 0)
      })

      return process
    })

    await expect(
      prepareYtDlpFormatDownload('https://x.com/user/status/123', 'hls-fragile'),
    ).rejects.toThrow(new YtDlpDownloaderError('SERVICE_UNAVAILABLE'))
  })
})
