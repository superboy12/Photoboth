import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const inputDir = path.join(__dirname, '../frames-input')
const outputDir = path.join(__dirname, '../public/frames')

// Configuration for the transparent hole
// Adjust these percentages to change how large the photo hole is relative to the frame
const HOLE_WIDTH_PERCENT = 0.85
const HOLE_HEIGHT_PERCENT = 0.70
const HOLE_ROUNDING_PX = 30

async function processFrames() {
  if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir, { recursive: true })
    console.log(`Created input directory at ${inputDir}`)
    console.log(`Please place your JPG frames in this folder and run the script again.`)
    return
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const files = fs.readdirSync(inputDir)
  const jpgFiles = files.filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg'))

  if (jpgFiles.length === 0) {
    console.log(`No JPG files found in ${inputDir}`)
    return
  }

  console.log(`Found ${jpgFiles.length} frames to process...`)

  for (const file of jpgFiles) {
    const inputPath = path.join(inputDir, file)
    const fileNameWithoutExt = path.parse(file).name
    const outputPath = path.join(outputDir, `${fileNameWithoutExt}.png`)

    try {
      // Read metadata to get dimensions
      const metadata = await sharp(inputPath).metadata()
      const width = metadata.width || 1200
      const height = metadata.height || 1600

      // Calculate hole dimensions (centered)
      const holeW = Math.round(width * HOLE_WIDTH_PERCENT)
      const holeH = Math.round(height * HOLE_HEIGHT_PERCENT)
      const holeX = Math.round((width - holeW) / 2)
      
      // Let's place the hole slightly towards the top so there's room for logos at the bottom
      const holeY = Math.round((height - holeH) / 3) 

      // Create an SVG mask for the transparent hole
      const svgMask = `
        <svg width="${width}" height="${height}">
          <!-- White background (opaque) -->
          <rect x="0" y="0" width="${width}" height="${height}" fill="#fff" />
          <!-- Black hole (transparent) -->
          <rect x="${holeX}" y="${holeY}" width="${holeW}" height="${holeH}" rx="${HOLE_ROUNDING_PX}" ry="${HOLE_ROUNDING_PX}" fill="#000" />
        </svg>
      `

      console.log(`Processing: ${file}...`)

      await sharp(inputPath)
        // Sharpen and clarify (Perjelas kualitas)
        .modulate({
          brightness: 1.05,
          saturation: 1.1,
        })
        .sharpen({
          sigma: 1.5,
          m1: 1,
          m2: 2,
          x1: 2,
          y2: 10,
          y3: 20
        })
        // Apply the transparency mask
        .joinChannel(Buffer.from(svgMask))
        .toFormat('png')
        .toFile(outputPath)

      console.log(`✅ Success: Saved to public/frames/${fileNameWithoutExt}.png`)
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err)
    }
  }

  console.log('\nAll done! You can now use these PNGs in your application.')
  console.log('To register them, add their names to src/lib/frames.ts')
}

processFrames()
