"use client"
import React, { useState } from 'react';

const TextToSpeechForm = () => {
    const [text, setText] = useState('');
    const postBlog = async ({
        text,
    }: {
        text: string;
    }) => {
        const res = await fetch("/api/speak", {
            method: "POST",
            body: JSON.stringify({ text }),
            //@ts-ignore
            "Content-Type": "application/json",
        });  
        return res.json();
    };
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        await postBlog({text});
    };

    return (
        <div className='bg-white'>
            <form onSubmit={handleSubmit}>
                <div className='bg-transparent text-black'>
                    <label>
                        Text:
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    </label>
                </div>
                <button type="submit" className='bg-black text-md text-yellow-500'>Speak</button>
            </form>

        </div>
    );
};

export default TextToSpeechForm;
