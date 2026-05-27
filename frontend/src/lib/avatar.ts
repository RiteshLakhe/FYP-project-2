export const getAvatarUrl = (fullname = "RentEase User") =>
  `https://avatar.iran.liara.run/username?username=${encodeURIComponent(
    fullname
  )}`;

export const resolveAvatar = (fullname?: string | null, profileImage?: string | null) =>
  profileImage || getAvatarUrl(fullname || "RentEase User");
