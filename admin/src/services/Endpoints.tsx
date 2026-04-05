interface ADMIN {
  GET_ADMIN: string;
}

interface AuthEndpoints {
  LOGIN: string;
}

interface UserEndpoints {
  GET_ALL_USERS: string;
  GET_USER_BY_ID: (id: string) => string;
}

interface PropertyEndpoints {
  GET_ALL: string;
  GET_BY_ID: (id: string) => string;
  GET_BY_OWNER: (userId: string) => string;
}

export const API_ENDPOINTS: {
  ADMIN: ADMIN;
  AUTH: AuthEndpoints;
  USER: UserEndpoints;
  PROPERTY: PropertyEndpoints;
} = {
  ADMIN: {
    GET_ADMIN: "/admin/getAdmin",
  },
  AUTH: {
    LOGIN: "auth/login",
  },
  USER: {
    GET_ALL_USERS: `/user/getAllUsers`,
    GET_USER_BY_ID: (id) => `/user/getUserById/${id}`,
  },
  PROPERTY: {
    GET_ALL: "/property/getAllProperty",
    GET_BY_ID: (id) => `/property/propertyById/${id}`,
    GET_BY_OWNER: (userId) => `/property/owner/${userId}`,
  }
};