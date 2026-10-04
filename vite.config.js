import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import fs from 'node:fs'
import { spawn } from 'node:child_process'

function directPrintPlugin() {
  return {
    name: 'direct-print-plugin',
    configureServer(server) {
      server.middlewares.use('/api/print-direct', (req, res) => {
        if (req.method === 'POST') {
          const chunks = []
          req.on('data', chunk => chunks.push(chunk))
          req.on('end', () => {
            const body = Buffer.concat(chunks)
            let printBuffer = null

            try {
              const text = body.toString('utf8')
              if (text.trim().startsWith('{')) {
                const parsed = JSON.parse(text)
                if (parsed.base64) {
                  printBuffer = Buffer.from(parsed.base64, 'base64')
                }
              }
            } catch (e) {
              // Not JSON
            }

            if (printBuffer) {
              // Direct raw bytes received from client canvas
              const scratchDir = path.join(process.cwd(), 'scratch')
              if (!fs.existsSync(scratchDir)) {
                fs.mkdirSync(scratchDir, { recursive: true })
              }
              const binPath = path.join(scratchDir, 'receipt_direct.bin')
              fs.writeFileSync(binPath, printBuffer)

              const ps = spawn('powershell', [
                '-ExecutionPolicy', 'Bypass',
                '-File', path.join(process.cwd(), 'send_raw.ps1'),
                '-PrinterName', 'BluePOS',
                '-FilePath', binPath
              ])

              let out = ''
              let errOut = ''
              ps.stdout.on('data', c => { out += c })
              ps.stderr.on('data', c => { errOut += c })

              ps.on('close', code => {
                const success = code === 0 && out.includes('Printed Graphic: True')
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success, out, err: errOut }))
              })

              ps.on('error', err => {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: false, error: err.message }))
              })
            } else {
              // Fallback to raster-print.cjs
              const scriptPath = path.join(process.cwd(), 'raster-print.cjs')
              const proc = spawn('node', [scriptPath])

              let out = ''
              let errOut = ''
              proc.stdout.on('data', chunk => { out += chunk })
              proc.stderr.on('data', chunk => { errOut += chunk })

              proc.on('close', (code) => {
                const success = code === 0 && out.includes('Printed Graphic: True')
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success, out, err: errOut }))
              })

              proc.on('error', (err) => {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: false, error: err.message }))
              })
            }
          })
        } else {
          res.statusCode = 405
          res.end()
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    directPrintPlugin(),
  ],
})