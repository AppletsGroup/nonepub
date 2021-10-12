import { createUniqueId } from '@/utils'
import { sleep } from './sleep'

export interface FileState {
  id: string
  file: File
  status: 'inited' | 'preview' | 'uploading' | 'uploaded' | 'error'
  progress: number
  width?: number
  height?: number
  url?: string
}

export type FileStateChangeListener = (
  cb: (uploadState: FileState) => void,
) => void

export type FileStateListener = (
  uploadState: FileState,
  onFileStateChange: FileStateChangeListener,
) => void

export class FileManager {
  private input: HTMLInputElement
  private listeners: FileStateListener[] = []
  private stateListenerMap = new Map<string, ((state: FileState) => void)[]>()

  constructor() {
    this.input = this.createInput()
  }

  private getPreview(
    file: File,
  ): Promise<{ width: number; height: number; url: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const image = new Image()
        image.onload = () => {
          resolve({
            width: image.width,
            height: image.height,
            url: image.src,
          })
        }
        image.onerror = (ev) => {
          if (typeof ev === 'string') {
            reject(new Error(ev))
          } else {
            reject(ev)
          }
        }

        image.src = reader.result as string
      }
      reader.onerror = (ev) => {
        reject(new Error('preview file error'))
      }

      reader.readAsDataURL(file)
    })
  }

  async doUpload(state: FileState) {
    const { url, width, height } = await this.getPreview(state.file)
    state = {
      ...state,
      status: 'preview',
      width,
      height,
      url,
    }
    this.triggerFileStateChange(state)
    state = {
      ...state,
      status: 'uploading',
    }
    this.triggerFileStateChange(state)
    await sleep(1000)
    state = {
      ...state,
      status: 'uploaded',
      progress: 100,
    }
    this.triggerFileStateChange(state)
  }

  uploadFile(file: File) {
    this.listeners.forEach((listener) => {
      const fileState: FileState = {
        id: createUniqueId(),
        file,
        progress: 0,
        status: 'inited',
      }

      listener(fileState, (cb) => {
        this.onFileStateChange(fileState, cb)
      })

      this.doUpload(fileState)
    })
  }

  private createInput() {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('name', 'file')
    input.style.display = 'none'
    document.body.append(input)
    input.addEventListener('change', (e) => {
      const file = (e.target as any).files[0] as File
      this.uploadFile(file)
      this.input.value = ''
    })
    return input
  }

  onFileStateChange(fileState: FileState, cb: (state: FileState) => void) {
    if (!this.stateListenerMap.has(fileState.id)) {
      this.stateListenerMap.set(fileState.id, [])
    }
    const fileStateListeners = this.stateListenerMap.get(fileState.id)!
    fileStateListeners.push(cb)
  }

  private triggerFileStateChange(nextState: FileState) {
    const cbs = this.stateListenerMap.get(nextState.id) ?? []
    cbs.forEach((cb) => cb(nextState))
  }

  onNewFile(listener: FileStateListener) {
    this.listeners.push(listener)
  }

  openPicker() {
    this.input.click()
  }
}
