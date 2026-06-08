import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebase.js";

// ==================== USERS ====================

export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getUserById(userId) {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function getUsersByRole(role) {
  const q = query(collection(db, "users"), where("role", "==", role));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function createUser(userData) {
  const docRef = await addDoc(collection(db, "users"), {
    ...userData,
    createdAt: new Date(),
    role: userData.role || "user"
  });
  return { id: docRef.id, ...userData };
}

export async function updateUser(userId, updates) {
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, updates);
}

export async function deleteUser(userId) {
  const docRef = doc(db, "users", userId);
  await deleteDoc(docRef);
}

export function subscribeToUsers(callback) {
  return onSnapshot(collection(db, "users"), (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(users);
  });
}

// ==================== CLASSES ====================

export async function getAllClasses() {
  const snapshot = await getDocs(collection(db, "classes"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getClassById(classId) {
  const docRef = doc(db, "classes", classId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function getClassesByCreator(creatorId) {
  const q = query(
    collection(db, "classes"),
    where("createdBy", "==", creatorId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function createClass(classData) {
  const docRef = await addDoc(collection(db, "classes"), {
    ...classData,
    createdAt: new Date()
  });
  return { id: docRef.id, ...classData };
}

export async function updateClass(classId, updates) {
  const docRef = doc(db, "classes", classId);
  await updateDoc(docRef, updates);
}

export async function deleteClass(classId) {
  const docRef = doc(db, "classes", classId);
  await deleteDoc(docRef);
}

export function subscribeToClasses(callback) {
  return onSnapshot(collection(db, "classes"), (snapshot) => {
    const classes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(classes);
  });
}

// ==================== QUESTION PACKAGES ====================

export async function getAllQuestionPackages() {
  const snapshot = await getDocs(collection(db, "question_packages"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getQuestionPackageById(packageId) {
  const docRef = doc(db, "question_packages", packageId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function getPackagesByCreator(creatorId) {
  const q = query(
    collection(db, "question_packages"),
    where("createdBy", "==", creatorId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function createQuestionPackage(packageData) {
  const docRef = await addDoc(collection(db, "question_packages"), {
    ...packageData,
    createdAt: new Date()
  });
  return { id: docRef.id, ...packageData };
}

export async function updateQuestionPackage(packageId, updates) {
  const docRef = doc(db, "question_packages", packageId);
  await updateDoc(docRef, updates);
}

export async function deleteQuestionPackage(packageId) {
  const docRef = doc(db, "question_packages", packageId);
  await deleteDoc(docRef);
}

export function subscribeToQuestionPackages(callback) {
  return onSnapshot(collection(db, "question_packages"), (snapshot) => {
    const packages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(packages);
  });
}

// ==================== QUESTIONS (Subcollection) ====================

export async function getQuestionsByPackageId(packageId) {
  const snapshot = await getDocs(
    collection(db, "question_packages", packageId, "questions")
  );
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function addQuestionToPackage(packageId, questionData) {
  const docRef = await addDoc(
    collection(db, "question_packages", packageId, "questions"),
    {
      ...questionData,
      createdAt: new Date()
    }
  );
  return { id: docRef.id, ...questionData };
}

export async function updateQuestion(packageId, questionId, updates) {
  const docRef = doc(
    db,
    "question_packages",
    packageId,
    "questions",
    questionId
  );
  await updateDoc(docRef, updates);
}

export async function deleteQuestion(packageId, questionId) {
  const docRef = doc(
    db,
    "question_packages",
    packageId,
    "questions",
    questionId
  );
  await deleteDoc(docRef);
}

export function subscribeToQuestions(packageId, callback) {
  return onSnapshot(
    collection(db, "question_packages", packageId, "questions"),
    (snapshot) => {
      const questions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(questions);
    }
  );
}

// ==================== INSTRUCTOR APPLICATIONS ====================

export async function createInstructorApplication(applicationData) {
  const docRef = await addDoc(collection(db, "instructor_applications"), {
    ...applicationData,
    status: "pending", // pending, approved, rejected
    createdAt: new Dat