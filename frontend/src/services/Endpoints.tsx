interface AuthEndpoints {
  LOGIN: string;
  REGISTER: string;
  LOGOUT: string;
  OTP: string;
  VERIFY_LOGIN_OTP: string;
  RESEND_LOGIN_OTP: string;
  RESEND_SIGNUP_OTP: string;
  FORGOT_PASSWORD: string;
  RESET_PASSWORD: (token: string) => string;
}

interface UserEndpoints {
  PROFILE: string;
  SWITCH_ROLE: string;
  GET_USER_BY_ID: (id: string) => string;
  UPDATE_USER: (id: string) => string;
  SAVE_PROPERTY: string,
  GET_SAVED_PROPERTY: string;
  UNSAVE_PROPERTY: (propertyId: string) => string;
  SEND_ENQUIRY: string;
  SEND_MAIL: string;
}

interface PropertyEndpoints {
  ADD: (id: string) => string;
  GET_ALL: string;
  GET_BY_ID: (id: string) => string;
  GET_BY_OWNER: (userId: string) => string;
  UPDATE: (id: string) => string;
  DELETE: (id: string) => string;
  UPDATE_STATUS: (id: string) => string,
}

export const API_ENDPOINTS: {
  AUTH: AuthEndpoints;
  USER: UserEndpoints;
  PROPERTY: PropertyEndpoints;
} = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/user/registerUser",
    LOGOUT: "/auth/logout",
    OTP: "/user/verify-otp",
    VERIFY_LOGIN_OTP: "/auth/verify-login-otp",
    RESEND_LOGIN_OTP: "/auth/resend-login-otp",
    RESEND_SIGNUP_OTP: "/user/resend-signup-otp",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: (token) => `/auth/reset-password/${token}`,
  },

  USER: {
    PROFILE: "/user/profile",
    SWITCH_ROLE: "/user/switch-role",
    GET_USER_BY_ID: (id) => `/user/getUserById/${id}`,
    UPDATE_USER: (id) => `/user/updateUser/${id}`,
    SAVE_PROPERTY: "/user/save-properties",
    UNSAVE_PROPERTY: (propertyId) => `/user/unsave-property/${propertyId}`,
    GET_SAVED_PROPERTY: "/user/get-saved-properties",
    SEND_ENQUIRY: "/user/send-enquiry",
    SEND_MAIL: "/user/contact",
  },

  PROPERTY: {
    ADD: (id) => `/property/postProperty/${id}`,
    GET_ALL: "/property/getAllProperty",
    GET_BY_ID: (id) => `/property/propertyById/${id}`,
    GET_BY_OWNER: (userId) => `/property/owner/${userId}`,
    UPDATE: (id) => `/property/updateProperty/${id}`,
    DELETE: (id) => `/property/deleteProperty/${id}`,
    UPDATE_STATUS: (id) => `/property/updateStatus/${id}`, 
  }
};
