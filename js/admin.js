// js/admin.js
import { auth, db, createUserWithEmailAndPassword, doc, setDoc, addDoc, serverTimestamp, collection } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  const addUserForm = document.getElementById('add-user-form');
  const addNewsForm = document.getElementById('add-news-form');

  if (addUserForm) {
    addUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('userEmail').value.trim();
      const password = document.getElementById('userPassword').value;
      const role = document.getElementById('userRole').value;

      if (!role) {
        alert('Выберите роль!');
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Генерация уникального номера XX-XXXXXX-XX
        const regNumber = await generateUniqueRegNumber();

        await setDoc(doc(db, "users", user.uid), {
          fullName,
          email,
          regNumber,
          role,
          createdAt: serverTimestamp()
        });

        alert(Житель добавлен!\nEmail: ${email}\nРег. номер: ${regNumber});
        addUserForm.reset();
      } catch (err) {
        alert('Ошибка: ' + err.message);
      }
    });
  }

  if (addNewsForm) {
    addNewsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('newsTitle').value.trim();
      const text = document.getElementById('newsText').value.trim();

      try {
        await addDoc(collection(db, "news"), {
          title,
          text,
          authorUid: auth.currentUser.uid,
          authorName: 'Администрация', // можно подтянуть имя
          createdAt: serverTimestamp()
        });
        alert('Новость опубликована!');
        addNewsForm.reset();
      } catch (err) {
        alert('Ошибка: ' + err.message);
      }
    });
  }
});

// Генерация уникального номера
async function generateUniqueRegNumber() {
  let num;
  const used = new Set();

  // Собираем существующие номера (для простоты — загружаем все, при 100 юзерах ок)
  const usersSnap = await getDocs(collection(db, "users"));
  usersSnap.forEach(d => {
    const r = d.data().regNumber;
    if (r) used.add(r);
  });

  do {
    const p1 = String(Math.floor(10 + Math.random() * 90)); // 10-99
    const p2 = String(Math.floor(100000 + Math.random() * 900000)).padStart(6, '0');
    const p3 = String(Math.floor(10 + Math.random() * 90));
    num = ${p1}-${p2}-${p3};
  } while (used.has(num));

  return num;
}
