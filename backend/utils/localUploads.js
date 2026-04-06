const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const uploadsRoot = path.join(__dirname, "..", "uploads");

const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const sanitizeName = (name) =>
  name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");

const saveLocalFile = async (file, folder, baseUrl) => {
  const ext = path.extname(file.originalname) || ".bin";
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}-${sanitizeName(path.basename(file.originalname, ext))}${ext}`;
  const targetDir = path.join(uploadsRoot, folder);

  await ensureDir(targetDir);
  await fs.writeFile(path.join(targetDir, name), file.buffer);

  return `${baseUrl}/uploads/${folder}/${name}`;
};

const saveLocalFiles = async (files, folder, baseUrl) =>
  Promise.all(files.map((file) => saveLocalFile(file, folder, baseUrl)));

module.exports = { saveLocalFile, saveLocalFiles };
