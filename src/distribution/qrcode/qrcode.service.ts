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

    const filePath = path.join(uploadsDir, `${uniqueId}.png`);
    this.logger.debug(`QR code will be saved to: ${filePath}`);

    try {
      // Generate QR Code
      await QRCode.toFile(filePath, data, {
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
        margin: 1,
        scale: 8,
      });

      // Verify file was created
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        this.logger.debug(`QR code file created successfully. Size: ${stats.size} bytes`);
      } else {
        this.logger.error('QR code file was not created');
      }

      return filePath;
    } catch (error) {
      this.logger.error(`Error generating QR code: ${error.message}`);
      throw error;
    }
  }
}
