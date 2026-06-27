import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/infrastructure/database/database.service';
import { EncryptionService } from 'src/infrastructure/crypto/encryption.service';
import { generateSecret, generateURI, verify as otplibVerify } from 'otplib';
import * as qrcode from 'qrcode';
import * as crypto from 'crypto';
import { hash, verify } from 'argon2';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Generates a new 2FA secret, builds a QR code data URL,
   * and saves the secret as "pending" (enabled = false) in the DB.
   */
  async generate2FASecret(userId: string, email: string) {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
      include: { twoFactor: true },
    });

    if (user?.twoFactor?.enabled) {
      throw new BadRequestException('Two-Factor Authentication is already enabled');
    }

    const secret = generateSecret();
    const appName = 'SecureAuthSystem';
    const otpauthUrl = generateURI({
      issuer: appName,
      label: email,
      secret: secret,
    });
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
    const encryptedSecret = this.encryptionService.encrypt(secret);

    // Save to the database as pending
    await this.databaseService.userTwoFactor.upsert({
      where: { userId },
      update: {
        secret: encryptedSecret,
        enabled: false,
      },
      create: {
        userId,
        secret: encryptedSecret,
        enabled: false,
      },
    });

    return {
      secret,
      qrCodeDataUrl,
    };
  }

  /**
   * Verifies the setup code, generates 10 backup codes,
   * hashes them, and sets enabled = true.
   */
  async enable2FA(userId: string, code: string) {
    const twoFactorRecord = await this.databaseService.userTwoFactor.findUnique({
      where: { userId },
    });

    if (!twoFactorRecord) {
      throw new BadRequestException('MFA setup not initialized');
    }

    if (twoFactorRecord.enabled) {
      throw new BadRequestException('Two-Factor Authentication is already enabled');
    }

    const decryptedSecret = this.encryptionService.decrypt(twoFactorRecord.secret);
    const verificationResult = await otplibVerify({
      token: code,
      secret: decryptedSecret,
    });

    if (!verificationResult.valid) {
      throw new BadRequestException('Invalid verification code');
    }

    // Generate 10 backup codes (e.g. "ABCD-1234")
    const plaintextBackupCodes: string[] = [];
    const hashedBackupCodes: string[] = [];

    for (let i = 0; i < 10; i++) {
      const code1 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const code2 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const backupCode = `${code1}-${code2}`;
      plaintextBackupCodes.push(backupCode);

      const hashed = await hash(backupCode);
      hashedBackupCodes.push(hashed);
    }

    await this.databaseService.userTwoFactor.update({
      where: { userId },
      data: {
        enabled: true,
        recoveryCodes: hashedBackupCodes,
        verifiedAt: new Date(),
      },
    });

    return {
      success: true,
      backupCodes: plaintextBackupCodes,
    };
  }

  /**
   * Deactivates and removes the user's 2FA record.
   */
  async disable2FA(userId: string, code: string) {
    const twoFactorRecord = await this.databaseService.userTwoFactor.findUnique({
      where: { userId },
    });

    if (!twoFactorRecord || !twoFactorRecord.enabled) {
      throw new BadRequestException('Two-Factor Authentication is not enabled');
    }

    const decryptedSecret = this.encryptionService.decrypt(twoFactorRecord.secret);
    const verificationResult = await otplibVerify({
      token: code,
      secret: decryptedSecret,
    });

    if (!verificationResult.valid) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.databaseService.userTwoFactor.delete({
      where: { userId },
    });

    return { success: true };
  }

  /**
   * Verifies the code (TOTP or single-use backup code).
   * If a backup code is matched, it is removed from the user's list.
   */
  async verifyCode(userId: string, code: string): Promise<boolean> {
    const twoFactorRecord = await this.databaseService.userTwoFactor.findUnique({
      where: { userId },
    });

    if (!twoFactorRecord || !twoFactorRecord.enabled) {
      return false;
    }

    // 1. Try verifying as standard TOTP code
    const decryptedSecret = this.encryptionService.decrypt(twoFactorRecord.secret);
    const verificationResult = await otplibVerify({
      token: code,
      secret: decryptedSecret,
    });

    if (verificationResult.valid) {
      return true;
    }

    // 2. Try verifying as a backup recovery code
    const recoveryCodes = twoFactorRecord.recoveryCodes;
    let matchedIndex = -1;

    for (let i = 0; i < recoveryCodes.length; i++) {
      const isMatch = await verify(recoveryCodes[i], code);
      if (isMatch) {
        matchedIndex = i;
        break;
      }
    }

    if (matchedIndex !== -1) {
      // Remove used backup code from the list
      const updatedBackupCodes = recoveryCodes.filter((_, idx) => idx !== matchedIndex);
      await this.databaseService.userTwoFactor.update({
        where: { userId },
        data: {
          recoveryCodes: updatedBackupCodes,
        },
      });
      return true;
    }

    return false;
  }
}
