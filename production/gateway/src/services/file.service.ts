import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import * as fs from 'fs';
import * as sharp from 'sharp';

@Injectable()
export class FileService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initFiles();
  }

  async initFiles() {
    try {
      const filesDir = this.configService.get('FILES_DIR');
      if (!fs.existsSync(filesDir)) {
        fs.mkdirSync(filesDir, { recursive: true, mode: 0o755 });
      }
    } catch {
      // ignore
    }
  }

  async compressImage(file: Express.Multer.File) {
    try {
      return sharp(file.buffer)
        .resize(400, 400, {
          fit: 'cover',
          position: 'north',
          withoutEnlargement: true,
        })
        .png({
          compressionLevel: 9,
          quality: 50,
          palette: true,
          force: true,
        })
        .toBuffer();
    } catch (error) {
      console.error(error);
    }
  }

  async saveAvatarFile(
    username: string,
    oldAvatar: string,
    file: Express.Multer.File,
  ) {
    try {
      try {
        const oldAvatarPath = `${this.configService.get(
          'FILES_DIR',
        )}/${oldAvatar}`;
        await fs.promises.unlink(oldAvatarPath);
      } catch {
        // ignore
      }

      const filePath = `${this.configService.get('FILES_DIR')}/${username}.png`;
      await fs.promises.writeFile(filePath, await this.compressImage(file));

      return filePath;
    } catch (error) {
      console.error(error);
    }
  }

  async getAvatarFile(username: string) {
    try {
      return fs.createReadStream(
        `${this.configService.get('FILES_DIR')}/${username}.png`,
      );
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
