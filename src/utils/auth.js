import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  signOut,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";

import { auth } from "./setup";
import { fsSet, fsUpdate, fsWhere } from "./store";


// Generate unique 8-digit Admin ID
function generate8DigitId() {
  return Math.floor(
    10000000 + Math.random() * 90000000
  ).toString();
}


export async function generateUniqueAdminId() {
  let id;
  let exists = true;

  while (exists) {
    id = generate8DigitId();

    const found = await fsWhere(
      "users",
      "adminId",
      "==",
      id
    );

    exists = found.length > 0;
  }

  return id;
}


// Register Admin — auto-generates permanent Admin ID + saves developer mobile
export async function registerAdmin(
  email,
  password,
  profile
) {
  const c = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await sendEmailVerification(c.user);

  const adminId = await generateUniqueAdminId();


  // Developer ka mobile fetch karo
  const devMatch = await fsWhere(
    "users",
    "role",
    "==",
    "developer"
  );

  const devMobile = devMatch[0]?.mobile || "";


  await fsSet(
    "users",
    c.user.uid,
    {
      uid: c.user.uid,
      email,
      ...profile,
      role: "admin",
      adminId,
      devMobile,
      blocked: false,
      createdAt: Date.now()
    }
  );


  return {
    user: c.user,
    adminId
  };
}


// Register Student — must provide a valid Admin ID to link under that admin + saves admin mobile
export async function registerStudent(
  email,
  password,
  profile,
  adminId
) {
  const adminMatch = await fsWhere(
    "users",
    "adminId",
    "==",
    adminId
  );


  if (adminMatch.length === 0) {
    throw new Error(
      "Invalid Admin ID. Please check and try again."
    );
  }


  const c = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await sendEmailVerification(c.user);


  // Admin ka mobile fetch karo
  const adminMobile =
    adminMatch[0]?.mobile || "";


  await fsSet(
    "users",
    c.user.uid,
    {
      uid: c.user.uid,
      email,
      ...profile,
      role: "student",
      adminId,
      adminMobile,
      blocked: false,
      createdAt: Date.now()
    }
  );


  return c.user;
}


// Register Developer (Secret Key checked before calling this)
export async function registerDeveloper(
  email,
  password,
  profile
) {
  const c = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await sendEmailVerification(c.user);


  await fsSet(
    "users",
    c.user.uid,
    {
      uid: c.user.uid,
      email,
      ...profile,
      role: "developer",
      blocked: false,
      createdAt: Date.now()
    }
  );


  return c.user;
}


export async function loginUser(
  email,
  password
) {
  const c = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return c.user;
}


export async function logoutUser() {
  await signOut(auth);
}


export async function resetPassword(email) {
  await sendPasswordResetEmail(
    auth,
    email
  );
}


export async function reauthenticate(
  currentPassword
) {
  const user = auth.currentUser;

  const cred =
    EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

  await reauthenticateWithCredential(
    user,
    cred
  );
}


export async function changeUserPassword(
  currentPassword,
  newPassword
) {
  await reauthenticate(currentPassword);

  await updatePassword(
    auth.currentUser,
    newPassword
  );
}


export async function changeUserEmail(
  currentPassword,
  newEmail
) {
  await reauthenticate(currentPassword);

  await updateEmail(
    auth.currentUser,
    newEmail
  );

  await fsUpdate(
    "users",
    auth.currentUser.uid,
    {
      email: newEmail
    }
  );
}


export async function updateUserProfile(
  uid,
  data
) {
  return await fsUpdate(
    "users",
    uid,
    data
  );
}