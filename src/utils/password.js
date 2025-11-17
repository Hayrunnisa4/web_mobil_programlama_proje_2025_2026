import bcrypt from 'bcryptjs';

const saltRounds = Number(process.env.PASSWORD_SALT_ROUNDS || 10);

export async function hashPassword(password) {
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

