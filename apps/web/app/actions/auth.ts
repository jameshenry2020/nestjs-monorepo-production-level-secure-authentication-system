'use server';

import { backendApi } from '@/lib/backend-api';
import { setAuthCookies, clearAuthCookies, getAuthTokens } from '@/lib/cookies';

export async function loginAction(credentials: any) {
  try {
    const { data } = await backendApi.post('/auth/sign-in', credentials);
    
    if (data.require2FA) {
      return {
        success: true,
        require2FA: true,
        twoFactorToken: data.twoFactorToken,
      };
    }

    const { access_token, refresh_token } = data;

    // Set the session cookies
    await setAuthCookies(access_token, refresh_token);

    // Load full profile details
    const profileRes = await backendApi.get('/auth/profile', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return {
      success: true,
      user: profileRes.data.user,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Invalid email or password',
    };
  }
}

export async function signupAction(signupData: any) {
  try {
    const { data } = await backendApi.post('/auth/signup', signupData);
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to sign up',
    };
  }
}

export async function verifyEmailAction(verifyData: { email: string; otp: string }) {
  try {
    const { data } = await backendApi.post('/auth/otp-verification', verifyData);
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Invalid or expired OTP',
    };
  }
}

export async function resendOtpAction(email: string) {
  try {
    const { data } = await backendApi.post('/auth/resend-otp', { email });
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to resend OTP',
    };
  }
}

export async function forgotPasswordAction(emailData: { email: string }) {
  try {
    const { data } = await backendApi.post('/auth/forgot-password', emailData);
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to request reset link',
    };
  }
}

export async function resetPasswordAction(resetData: any) {
  try {
    const { data } = await backendApi.post('/auth/reset-password', resetData);
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to reset password',
    };
  }
}

export async function changePasswordAction(changeData: any) {
  try {
    const { data } = await backendApi.post('/auth/change-password', changeData);
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to change password',
    };
  }
}

export async function logoutAction() {
  try {
    const tokens = await getAuthTokens();
    if (tokens.accessToken) {
      await backendApi.post('/auth/logout', null, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });
    }
  } catch (error) {
    // Ignore backend logout errors to ensure cookies get deleted
  } finally {
    await clearAuthCookies();
  }
  return { success: true };
}

export async function setup2FAAction() {
  try {
    const { data } = await backendApi.post('/auth/2fa/setup');
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to initiate 2FA setup',
    };
  }
}

export async function enable2FAAction(code: string) {
  try {
    const { data } = await backendApi.post('/auth/2fa/enable', { code });
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to enable 2FA. Please verify the code.',
    };
  }
}

export async function disable2FAAction(code: string) {
  try {
    const { data } = await backendApi.post('/auth/2fa/disable', { code });
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to disable 2FA. Please verify the code.',
    };
  }
}

export async function authenticate2FAAction(twoFactorToken: string, code: string) {
  try {
    const { data } = await backendApi.post('/auth/2fa/authenticate', { twoFactorToken, code });
    const { access_token, refresh_token } = data;

    // Set the session cookies
    await setAuthCookies(access_token, refresh_token);

    // Load full profile details
    const profileRes = await backendApi.get('/auth/profile', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return {
      success: true,
      user: profileRes.data.user,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Invalid verification code',
    };
  }
}
