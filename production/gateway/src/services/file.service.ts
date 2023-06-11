import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import * as fs from 'fs';
import sharp from 'sharp';
import { encode } from 'blurhash';

@Injectable()
export class FileService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initFiles();
  }

  async initFiles() {
    const filesDir = this.configService.get('FILES_DIR');
    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir, { recursive: true, mode: 0o755 });
    }
  }

  async compressImage(file: Express.Multer.File) {
    try {
      await sharp(file.buffer)
        .resize(500, 500, {
          fit: 'cover',
        })
        .png({
          compressionLevel: 9,
          quality: 80,
          palette: true,
          force: true,
        })
        .toBuffer();
    } catch (error) {
      console.error(error);
    }
  }

  async saveAvatarFile(username: string, file: Express.Multer.File) {
    try {
      const clamped = new Uint8ClampedArray(file.buffer);
      const hash = encode(clamped, 32, 32, 4, 4);
      const filePath = `${this.configService.get(
        'FILES_DIR',
      )}/${username}__+__${hash}`;
      await fs.promises.writeFile(filePath, file.buffer);

      return filePath;
    } catch (error) {
      console.error(error);
    }
  }
}
