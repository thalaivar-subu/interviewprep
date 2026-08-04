# REACT JS

1. Virtual DOM
React keeps a lightweight copy of the DOM and updates only the changed parts.
Improves rendering performance.
setCount(count + 1); // React compares old vs new Virtual DOM

2. JSX
HTML-like syntax that compiles to React.createElement().
<h1>Hello</h1>

3. Functional Component
function App() {
  return <h1>Hello</h1>;
}

4. Props
Read-only data passed from parent to child.
<Child name="Subu" />
function Child({ name }) {
  return <p>{name}</p>;
}

5. State (useState)
Component's local mutable data. Updating state triggers a re-render.
const [count, setCount] = useState(0);

6. useEffect
Runs side effects like API calls, subscriptions, timers.
useEffect(() => {
  fetchUsers();
}, []);

7. Dependency Array
[]          // once
[userId]    // when userId changes
// omitted   // every render


8. useMemo
Memoizes an expensive computed value.
const total = useMemo(() => calc(items), [items]);

9. useCallback
Memoizes a function to prevent unnecessary child re-renders.
const onClick = useCallback(() => save(), []);

10. React.memo
Prevents child re-render if props haven't changed.
export default React.memo(Button);

11. Controlled Component
Input value comes from React state.
<input value={name} onChange={e => setName(e.target.value)} />

12. Uncontrolled Component
Input value is managed by the DOM.
const ref = useRef();

13. useRef
Stores mutable values or DOM references without causing re-renders.
const inputRef = useRef();

14. Key
Helps React identify list items efficiently.
items.map(i => <li key={i.id}>{i.name}</li>)

15. Reconciliation
React compares old and new Virtual DOM (diffing) and updates only changed nodes.

16. Lifting State Up
Move shared state to the nearest common parent.
Parent
 ├── ChildA
 └── ChildB

17. Context API
Share data without prop drilling.
<UserContext.Provider value={user}>

18. Prop Drilling
Passing props through multiple intermediate components.
App → A → B → C

19. Lazy Loading
const Home = React.lazy(() => import("./Home"));

20. Error Boundary
Catches rendering errors in child components.
class ErrorBoundary extends React.Component {}

21. Custom Hook
Reuse stateful logic.
function useFetch() {}

22. useReducer
Alternative to useState for complex state updates.
dispatch({ type: "ADD" });

23. Why React Re-renders
State changes
Parent re-renders
Context changes

24. Prevent Re-renders
React.memo
useMemo
useCallback

25. React Lifecycle (Hooks)
Mount
  ↓
Render
  ↓
useEffect()
  ↓
State Update
  ↓
Re-render
  ↓
Cleanup

# JS FE
Hoisting
Variable and function declarations are moved to the top during compilation.
var is initialized with undefined; let/const are in the Temporal Dead Zone.
console.log(a); // undefined
var a = 10;

Currying
Converting a function with multiple arguments into a chain of single-argument functions.
const add = a => b => a + b;
add(2)(3); // 5

Closure
A function remembers variables from its outer scope even after the outer function has returned.
function counter() {
  let c = 0;
  return () => ++c;
}

Generator Function
A function that can pause and resume execution using yield.
function* gen() {
  yield 1;
  yield 2;
}

Pass by Value
Primitive values (number, string, boolean, etc.) are copied.
let a = 10;
let b = a;
b = 20; // a is still 10

Pass by Reference? (Actually: Pass by Sharing)
Objects are passed by value of their reference, so both variables refer to the same object.
let a = { x: 1 };
let b = a;
b.x = 2; // a.x is also 2

Event Loop
Continuously checks the Call Stack; when it's empty, it executes tasks from the Microtask Queue first, then the Callback Queue.
Call Stack
    ↓
Microtask Queue
    ↓
Callback Queue

Callback Queue (Macrotask Queue)
Holds tasks like setTimeout, setInterval, DOM events, and I/O callbacks.
setTimeout(() => console.log("timeout"), 0);
Microtask Queue
Holds higher-priority tasks like Promise callbacks and queueMicrotask().
Promise.resolve().then(() => console.log("promise"));