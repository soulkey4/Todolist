import './App.css';
import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCq_9gA9ZhfDisXy2HcTI4eREpf_rVmWl8",
  authDomain: "todolist-f2b2e.firebaseapp.com",
  projectId: "todolist-f2b2e",
  storageBucket: "todolist-f2b2e.appspot.com",
  messagingSenderId: "538777262384",
  appId: "1:538777262384:web:cda632be52526ef841d0f5",
  measurementId: "G-R4P409JYB0"
};

 // Initialize Firebase
 const app = initializeApp(firebaseConfig);
 const analytics = getAnalytics(app);
 const db = getFirestore(app);
 
 const TodoItemInputField = (props) => {
   const [input, setInput] = useState("");
 
   const onSubmit = () => {
     props.onSubmit(input);
     setInput("");
   };
 
   return (<div>
     <TextField
       id="todo-item-input"
       label="Todo Item"
       variant="outlined"
       onChange={(e) => setInput(e.target.value)} value={input}
     />
     <Button variant="outlined" onClick={onSubmit}>Submit</Button>
   </div>);
 };
 
 const TodoItem = (props) => {
   const style = props.todoItem.isFinished ? { textDecoration: 'line-through' } : {};
   return (<li>
     <span style={style} onClick={() => props.onTodoItemClick(props.todoItem)}>{props.todoItem.todoItemContent}</span>
     <Button variant="outlined" onClick={() => props.onRemoveClick(props.todoItem)}>Remove</Button>
   </li>);
 };
 
 
 const TodoItemList = (props) => {
   const todoList = props.todoItemList.map((todoItem, index) => {
     return <TodoItem
       key={index}
       todoItem={todoItem}
       onTodoItemClick={props.onTodoItemClick}
       onRemoveClick={props.onRemoveClick}
     />;
   });
   return (<div>
     <ul>{todoList}</ul>
   </div>);
 };
 
 function App() {
   const [todoItemList, setTodoItemList] = useState([]);
 
   const syncTodoItemListStateWithFirestore = () => {
    const q = query(collection(db, "todoItem"), orderBy("createdTime", "desc"));

    getDocs(q).then((querySnapshot) => {
       const firestoreTodoItemList = [];
       querySnapshot.forEach((doc) => {
         firestoreTodoItemList.push({
           id: doc.id,
           todoItemContent: doc.data().todoItemContent,
           isFinished: doc.data().isFinished,
           createdTime: doc.data().createdTime ?? 0,
         });
       });
       setTodoItemList(firestoreTodoItemList);
     });
   };
 
   useEffect(() => {
     syncTodoItemListStateWithFirestore();
   }, []);
   const onSubmit = async (newTodoItem) => {
     await addDoc(collection(db, "todoItem"), {
       todoItemContent: newTodoItem,
       isFinished: false,
       createdTime: Math.floor(Date.now() / 1000),
     });
     syncTodoItemListStateWithFirestore();
   };
 
   const onTodoItemClick = async (clickedTodoItem) => {
     const todoItemRef = doc(db, "todoItem", clickedTodoItem.id);
     await setDoc(todoItemRef, { isFinished: !clickedTodoItem.isFinished }, { merge: true });
     syncTodoItemListStateWithFirestore();
   };
 
   const onRemoveClick = async (removedTodoItem) => {
     const todoItemRef = doc(db, "todoItem", removedTodoItem.id);
     await deleteDoc(todoItemRef);
     syncTodoItemListStateWithFirestore();
   };
 
   return (
     <div className="App">
       <TodoItemInputField onSubmit={onSubmit} />
       <TodoItemList
         todoItemList={todoItemList}
         onTodoItemClick={onTodoItemClick}
         onRemoveClick={onRemoveClick}
       />
     </div>
   );
 }
 
 export default App;

