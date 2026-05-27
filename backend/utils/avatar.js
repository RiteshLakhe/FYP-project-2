const getAvatarUrl = (fullname = "RentEase User") =>
  `https://avatar.iran.liara.run/username?username=${encodeURIComponent(
    fullname
  )}`;

const ensureAvatar = (fullname, profileImage) => profileImage || getAvatarUrl(fullname);

module.exports = { getAvatarUrl, ensureAvatar };
