'use server';

import { backendApi } from '@/lib/backend-api';
import { setAuthCookies, clearAuthCookies, getAuthTokens } from '@/lib/cookies';

export async function loginAction(credentials: any) {
  try {
    const { data } = await backendApi.post('/auth/sign-in', credentials);
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
