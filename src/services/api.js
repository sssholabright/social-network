import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export const getPosts = async () => {
    const docRef = await getDocs(collection(db, 'posts'));
    return docRef.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}