import React, { useRef, useState, useReducer } from "react";
import { Typewriter } from "react-simple-typewriter";
import "react-simple-keyboard/build/css/index.css";
import Keyboard from "react-simple-keyboard";
import Layout from "./components/Layout";
import TypingArea from "./components/TypingArea";
import Result from "./components/Result";
import { allowedKeys, generateRandomWords } from "./helper";
import ErrorBeep from "./sound/beep.wav";
import "./App.css";

const initialState = {
  inputText: "Welcome, click start to begin the one-minute typing speed test",
  remainingText: "Welcome, click start to begin the one-minute typing speed test",
  completedText: "",
  showStats: false,
  progress: 0,
  accuracy: 0,
  errorIndex: 0,
  correctIndex: 0,
  wpm: 0,
  duration: 60,
  incorrect: false,
  started: false
};

type State = typeof initialState;

type Action =
  | { type: "START" }
  | { type: "END" }
  | { type: "DURATION"; payload: number }
  | { type: "ACCURACY"; payload: number }
  | { type: "WPM"; payload: number }
  | { type: "CORRECT" }
  | { type: "INCORRECT" }
  | { type: "RESET" };

const reducer = (state: State, action: Action): State => {
  const randomWords = generateRandomWords();

  switch (action.type) {
    case "START":
      return {
        ...state,
        started: true,
        showStats: false,
        inputText: randomWords,
        remainingText: randomWords
      };
    case "END":
      return {
        ...state,
        started: false,
        showStats: true,
        inputText: state.inputText,
        remainingText: state.remainingText,
        duration: state.duration
      };
    case "DURATION":
      return {
        ...state,
        duration: action.payload
      };
    case "ACCURACY":
      return {
        ...state,
        accuracy: action.payload
      };
    case "WPM":
      return {
        ...state,
        wpm: action.payload
      };
    case "CORRECT":
      return {
        ...state,
        progress: state.progress + 1,
        correctIndex: state.correctIndex + 1,
        remainingText: state.remainingText.slice(1),
        completedText: state.completedText + state.remainingText.charAt(0),
        incorrect: false
      };
    case "INCORRECT":
      return {
        ...state,
        incorrect: true,
        errorIndex: state.errorIndex + 1
      };
    case "RESET":
      return initialState;

    default:
      return state;
  }
};

function App() {
  const [
    {
      inputText,
      remainingText,
      completedText,
      showStats,
      progress,
      accuracy,
      errorIndex,
      correctIndex,
      wpm,
      duration,
      incorrect,
      started
    },
    dispatch
  ] = useReducer(reducer, initialState);
  const [keyboardLayout, setKeyboardLayout] = useState("default");
  const interval = useRef<number | null>(null);
  const areaRef = useRef<HTMLDivElement | null>(null);
  const errorBeepRef = useRef<HTMLAudioElement | null>(null);

  const handleStart = () => {
    dispatch({ type: "START" });
    if (areaRef.current) areaRef.current.focus();

    // Timer
    const now = Date.now();
    const seconds = now + 60 * 1000;

    interval.current = window.setInterval(() => {
      const secondLeft = Math.round((seconds - Date.now()) / 1000);
      if (secondLeft <= 0) {
        dispatch({ type: "END" });
        if (interval.current) window.clearInterval(interval.current);
      }
      dispatch({ type: "DURATION", payload: secondLeft });
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<Element>) => {
    if (showStats || !started || duration === 0) return;

    e.preventDefault();
    const { key } = e;

    if (allowedKeys.includes(key) && key !== "Shift") {
      if (key === inputText.charAt(progress)) {
        dispatch({ type: "CORRECT" });
      } else {
        dispatch({ type: "INCORRECT" });

        // error sound
        if (errorBeepRef.current) {
          errorBeepRef.current.currentTime = 0;
          errorBeepRef.current.play();
        }
      }
      if (progress > 5)
        dispatch({
          type: "ACCURACY",
          payload: Math.floor(((progress - errorIndex) / progress) * 100)
        });

      if (progress + 1 === inputText.length || errorIndex >= 50) dispatch({ type: "END" });
      // set wpm
      dispatch({ type: "WPM", payload: Math.round(correctIndex / 5) });
    }
  };
  const handleKeyboardInput = (input: string) => {
    if (!showStats && started && duration > 0) {
      if (input === remainingText.charAt(0)) {
        dispatch({ type: "CORRECT" });

        if (progress + 1 === inputText.length || errorIndex >= 49) {
          dispatch({ type: "END" });
        } else {
          const updatedRemainingText = remainingText.slice(1);
          dispatch({ type: "DURATION", payload: duration - 1 });

          if (progress >= 5) {
            const accuracyValue = Math.floor(((progress - errorIndex) / progress) * 100);
            dispatch({ type: "ACCURACY", payload: accuracyValue });
          }

          const wpmValue = Math.round(correctIndex / 5);
          dispatch({ type: "WPM", payload: wpmValue });

          dispatch({ type: "CORRECT" });
          dispatch({ type: "RESET" });
          dispatch({ type: "START" });
          dispatch({ type: "DURATION", payload: duration - 1 });
        }
      } else {
        dispatch({ type: "INCORRECT" });

        if (errorBeepRef.current) {
          errorBeepRef.current.currentTime = 0;
          errorBeepRef.current.play();
        }
      }
    }
  };

  const handleReload = () => {
    dispatch({ type: "RESET" });
    setTimeout(() => handleStart(), 100);
  };

  return (
    <>
      <Layout>
        {showStats ? (
          <Result
            completedText={completedText}
            inputText={inputText}
            errorIndex={errorIndex}
            accuracy={accuracy}
            wpm={wpm}
            showStats={showStats}
            handleReload={handleReload}
          />
        ) : (
          <>
            <div className='instructions-section'>
              <p>
                <span className='type'>Type the given</span>
                <Typewriter
                  cursor
                  cursorStyle='|'
                  delaySpeed={100}
                  deleteSpeed={50}
                  words={[" words inside the input field:"]}
                />
              </p>
            </div>
            <TypingArea
              completedText={completedText}
              inputText={inputText}
              errorIndex={errorIndex}
              duration={duration}
              started={started}
              incorrect={incorrect}
              areaRef={areaRef}
              handleKeyDown={handleKeyDown}
              remainingText={remainingText}
              handleStart={handleStart}
            />
            <Keyboard
              layoutName={keyboardLayout}
              onChange={(input) => handleKeyboardInput(input)}
            />
          </>
        )}
      </Layout>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio src={ErrorBeep} ref={errorBeepRef} hidden />
    </>
  );
}

export default App;
