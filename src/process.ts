declare global {
  namespace NodeJS {
    interface Process {
      browser?: boolean
    }
  }
}

process.browser = true

export {}
