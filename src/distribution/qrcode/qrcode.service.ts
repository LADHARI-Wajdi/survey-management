import { Injectable, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class QRCodeService {
  private readonly logger = new Logger(QRCodeService.name);

  async generateQRCode(data: string, uniqueId: string): Promise<string> {
    this.logger.debug(`Starting QR code generation for data: ${data}`);
    this.logger.debug(`Unique ID: ${uniqueId}`);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads', 'qrcodes');
    this.logger.debug(`Uploads directory path: ${uploadsDir}`);

    if (!fs.existsSync(uploadsDir)) {
      this.logger.debug('Creating uploads directory');
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Use relative path for storage
    const relativePath = path.join('uploads', 'qrcodes', `${uniqueId}.png`);
    const absolutePath = path.join(process.cwd(), relativePath);
    this.logger.debug(`QR code will be saved to: ${absolutePath}`);

    try {
      // Generate QR Code
      await QRCode.toFile(absolutePath, data, {
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
        margin: 1,
        scale: 8,
      });

      // Verify file was created
      if (fs.existsSync(absolutePath)) {
        const stats = fs.statSync(absolutePath);
        this.logger.debug(`QR code file created successfully. Size: ${stats.size} bytes`);
      } else {
        this.logger.error('QR code file was not created');
      }

      // Return the relative path for storage in the database
      return relativePath;
    } catch (error) {
      this.logger.error(`Error generating QR code: ${error.message}`);
      throw error;
    }
  }
}
