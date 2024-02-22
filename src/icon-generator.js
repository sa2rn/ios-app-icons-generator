import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const CONTENTS_FILENAME = 'Contents.json';

function getSize(size) {
  const [width, height] = size.split('x');

  return {
    width: parseInt(width, 10),
    height: parseInt(height, 10),
  };
}

function getScale(scale) {
  return scale ? parseInt(scale.split('x')[0], 10) : 1;
}

class IconGenerator {
  #originalIconPath;

  #outputDir;

  constructor(originalIconPath, outputDir) {
    assert(originalIconPath, 'originalIconPath is required');
    assert(outputDir, 'outputDir is required');

    this.#originalIconPath = originalIconPath;
    this.#outputDir = outputDir;
  }

  async generate() {
    const contents = await this.#getContents();
    contents.images = await Promise.all(contents.images.map(this.#processImage.bind(this)));
    await this.#saveContents(contents);
  }

  async #processImage(image) {
    const filename = await this.#createImage(image);

    return {
      ...image,
      filename,
    };
  }

  async #createImage(image) {
    const size = getSize(image.size);
    const scale = getScale(image.scale);
    const filename = `AppIcon-${size.width}x${size.height}@${scale}x-${image.idiom}.png`;

    await sharp(this.#originalIconPath)
      .resize({
        width: size.width * scale,
        height: size.height * scale,
      })
      .toFile(path.join(this.#outputDir, filename));

    return filename;
  }

  async #getContents() {
    try {
      const contents = await fs.readFile(this.#getContentsPath(), 'utf8');
      return JSON.parse(contents);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('Contents.json not found');
      } else {
        throw error;
      }
    }
  }

  #getContentsPath() {
    return path.join(this.#outputDir, CONTENTS_FILENAME);
  }

  async #saveContents(contents) {
    const str = JSON.stringify(contents, null, 2);
    await fs.writeFile(this.#getContentsPath(), str, 'utf8');
  }
}

export default IconGenerator;
