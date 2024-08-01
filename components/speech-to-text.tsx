"use client"
import useSpeechRecognition from '@/hooks/useSpeechRecognitionHook'
export default function Main(){
    const {
        text,
        startListening,
        stopListening,
        isListening,
        hasRecognitionSupport,

    } = useSpeechRecognition();
    return(
        <div>
            {hasRecognitionSupport ? (
                <>
                    <div>
                        <button onClick={startListening}>Start isListening</button>
                    </div>
                    <div>
                        <button onClick={stopListening}>stop listening</button>
                    </div>
                    {isListening ? <div>Your browser is currently listening</div> : null}
                    {text}
                </>
            ):
            (
                <h1>Your browser dont have speech recognition support</h1>
            )}
        </div>
    );
}