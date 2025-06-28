"use client";
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faGear, faPersonRunning, faXmark, faPaperPlane, faPencil, faForward, faRepeat, faDeleteLeft, faCircleNotch, faImage, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { useData } from '../context/AdventureContext';
import { PTSerifFont } from '../lib/fonts';
import { toast } from 'react-toastify';

import StoryHeader from '../components/headers/StoryHeader';

// Function to transform text with markdown-like syntax to HTML
const transformText = (text) => {
    let transformed = text.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    transformed = transformed.replace(/\*([^*]+)\*/g, '<i>$1</i>');
    transformed = transformed.replace(/\\n\\n/g, '<br><br>');
    return transformed;
};

// Function to animate the paragraph by revealing one word at a time
function AnimatedParagraph({ text, wordInterval, className }) {
    const [currentWordCount, setCurrentWordCount] = useState(0);
    const words = text.split(' ');
  
    useEffect(() => {
        setCurrentWordCount(0);
        let i = 0;
        const intervalId = setInterval(() => {
            i++;
            setCurrentWordCount(i);
            if (i >= words.length) {
                clearInterval(intervalId);
            }
        }, wordInterval);
        return () => clearInterval(intervalId);
    }, [text, wordInterval, words.length]);
  
    const isComplete = currentWordCount >= words.length;
    const displayedText = isComplete ? transformText(text) : words.slice(0, currentWordCount).join(' ');
  
    return (
        <><span className={className} dangerouslySetInnerHTML={{ __html: displayedText }} />{"\u00A0"}</>
    );
}

export default function StoryPage() {
    const { intro, title, essentials } = useData();

    const storyStarted = useRef(false);
    const [story, setStory] = useState([]);
    const [loading, setLoading] = useState(false);

    const [storyTitle, setStoryTitle] = useState('');
    const [plotEssentials, setPlotEssentials] = useState('');

    const [settingsOpen, setSettingsOpen] = useState(false);

    const [wordInterval, setWordInterval] = useState(30);
    const [responseTemperature, setResponseTemperature] = useState(1.0);

    const [customMode, setCustomMode] = useState(false);
    const [customInput, setCustomInput] = useState('');
    const [customActionType, setCustomActionType] = useState('do'); // options: "do", "say", "story"
    const [suggestedActions, setSuggestedActions] = useState([]);

    // Initialize the story with the selected adventure
    useEffect(() => {
        if (storyStarted.current) return;
        storyStarted.current = true;
        if (intro) {
            setStoryTitle(title ? title.trim() : 'Untitled Story');
            setPlotEssentials(essentials ? essentials.trim() : '');

            const introText = intro.trim();
            if (introText) {
                story.push({ type: 'intro', text: introText });
                generateParagraph('continue', essentials);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [intro, title, essentials]);

    // Prevents accidental page unloads (e.g., when the user tries to close/refresh the tab)
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = '';
        };
    
        window.addEventListener('beforeunload', handleBeforeUnload);
    
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // Function to generate a new paragraph based on the current story and essentials
    const generateParagraph = async (action, essentials, suggAction, suggContent) => {
        let updatedStory = [...story];

        if (action === 'retry')
        {
            updatedStory = story.slice(0, -1);
        }
        else if (action === 'custom') 
        {
            if (customActionType === 'do') {
                updatedStory.push({ type: 'player', text: `> You ${customInput.trim()}` });
            } else if (customActionType === 'say') {
                updatedStory.push({ type: 'player', text: `> You say "${customInput.trim()}"` });
            } else if (customActionType === 'story') {
                updatedStory.push({ type: 'ai', text: customInput.trim() });
            }
            setStory(updatedStory);
        }
        else if (action === 'suggestedAction')
        {
            if (suggAction === 'do') {
                updatedStory.push({ type: 'player', text: `> You ${suggContent.trim()}` });
            } else if (suggAction === 'say') {
                updatedStory.push({ type: 'player', text: `> You say "${suggContent.trim()}"` });
            }
            setStory(updatedStory);
        }

        let ess = essentials || plotEssentials;

        let processedStory = updatedStory.map(obj => obj.text).join(' ');

        let payload = { story: processedStory, plotEssentials: ess, temp: responseTemperature };

        setLoading(true);

        try {
            const response = await fetch('/api/expand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            let schema;
            try {
                schema = typeof data.text === 'string' ? JSON.parse(data.text) : data.text;
            } catch (jsonError) {
                throw new Error("Received bad JSON from AI.");
            }

            if (schema) {
                if (schema.storyExpansion) {
                    setStory([...updatedStory, { type: 'ai', text: schema.storyExpansion }]);
                }
                setSuggestedActions(schema.suggestedActions);
            }
        } catch (err) {
            toast.error('Generation error', {
                icon: <FontAwesomeIcon icon={faCircleExclamation} />,
            });
        }
        finally {
            setLoading(false);
        }
    };

    // =====================================================================================
    // Default actions
    // =====================================================================================

    // Continues/expands the current story
    const handleContinue = async () => {
        await generateParagraph('continue');
    };

    // Retries the last AI-generated paragraph
    const handleRetry = async () => {
        if (story.length > 0 && story[story.length - 1].type === 'ai') {
            await generateParagraph('retry');
        }
    };

    // Erases the last entry in the story (whether it's AI or player)
    const handleErase = () => {
        if (story.length > 0) {
            setStory(story.slice(0, story.length - 1));
        }
    };

    // =====================================================================================
    // Custom actions
    // =====================================================================================

    // Handles the custom input submission (do, say, story)
    const handleSubmitCustom = async () => {
        if (!customInput.trim()) return;

        await generateParagraph('custom');
        setCustomInput('');
        setCustomMode(false);
    };

    // Handles a suggested action click
    const handleSuggestedAction = async (action, content) => {
        await generateParagraph('suggestedAction', null, action, content);
        setCustomInput('');
        setCustomMode(false);
    }

    // Toggles the settings panel
    const toggleSettings = () => {
        setSettingsOpen(!settingsOpen);
    }

    return (
        <>
        <StoryHeader
            title={storyTitle || 'Untitled Story'}
            onSettingsClick={toggleSettings}
            settingsOpen={settingsOpen}
        />

        <div className="container">
            <div className="mainContent">
                <div className="storyBox">
                    {story.map((entry, index) => {
                        if (entry.type === 'ai') {
                            return (
                            <AnimatedParagraph
                                key={index}
                                text={entry.text}
                                wordInterval={wordInterval}
                                className={`storyText ${PTSerifFont.className} ${index === story.length - 1 ? 'latestEntry' : ''}`}
                            />
                            );
                        } 
                        else if (entry.type === 'image') {
                            return (
                                <div key={index} className="imageContainer">
                                    <Image src={entry.url} alt={entry.caption} className="storyImage" />
                                </div>
                            );
                        }
                        else {
                            let displayedText = entry.text;
                            let userActionIcon = null;
                            if (entry.type === 'player') {
                                displayedText = displayedText.trim().substring(1).trim();
                                if (displayedText.startsWith('You say')) {
                                    userActionIcon = <FontAwesomeIcon icon={faMessage} />;
                                } else if (displayedText.startsWith('You')) {
                                    userActionIcon = <FontAwesomeIcon icon={faPersonRunning} />;
                                }
                            }
                            return (
                                <span
                                    key={index}
                                    className={`storyText ${PTSerifFont.className} ${entry.type === 'player' ? 'userAction' : ''}`}
                                >
                                    {userActionIcon && userActionIcon}
                                    <span dangerouslySetInnerHTML={{ __html: transformText(displayedText) }} />{"\u00A0"}
                                </span>
                            );
                        }
                    })}
                </div>
            </div>
            {!loading ? (
                <>
                <p style={{ marginBottom: 0, color: "grey" }}>Suggested actions:</p>
                <div className="buttonGroup suggestedButtons">
                    {suggestedActions.map((action, index) => (
                        <button
                            key={index}
                            className={`${PTSerifFont.className}`}
                            onClick={() => handleSuggestedAction(action.actionType, action.actionContent)}
                        >
                            <FontAwesomeIcon icon={action.actionType === "do" ? faPersonRunning : action.actionType === "say" ? faMessage : faImage} /> {action.actionTitle}
                        </button>
                    ))}
                </div>
                {customMode ? (
                <div className="customMode">
                    <div className="buttonGroup">
                        <button
                            onClick={() => {
                            setCustomMode(false);
                            setCustomInput('');
                            }}
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                        <button
                            className={`${customActionType === 'do' ? 'activeButton' : 'button'} ${PTSerifFont.className}`}
                            onClick={() => setCustomActionType('do')}
                        >
                            <FontAwesomeIcon icon={faPersonRunning} /> Do
                        </button>
                        <button
                            className={`${customActionType === 'say' ? 'activeButton' : 'button'} ${PTSerifFont.className}`}
                            onClick={() => setCustomActionType('say')}
                        >
                            <FontAwesomeIcon icon={faMessage} /> Say
                        </button>
                        <button
                            className={`${customActionType === 'story' ? 'activeButton' : 'button'} ${PTSerifFont.className}`}
                            onClick={() => setCustomActionType('story')}
                        >
                            <FontAwesomeIcon icon={faPaperPlane} /> Story
                        </button>
                    </div>
                    <div className="buttonGroup">
                        <textarea
                            className={`textArea ${PTSerifFont.className}`}
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder={
                            customActionType === 'do'
                                ? 'What do you do?'
                                : customActionType === 'say'
                                ? 'What do you say?'
                                : 'What happens next?'
                            }
                        />
                        <button className={`button ${PTSerifFont.className}`} onClick={() => handleSubmitCustom()} disabled={loading}>
                            Submit
                        </button>
                    </div>
                </div>
                ) : (
                <div className="buttonGroup">
                    <button className={PTSerifFont.className} onClick={() => setCustomMode(true)}>
                        <FontAwesomeIcon icon={faPencil} /> Take a Turn
                    </button>
                    <button className={PTSerifFont.className} onClick={handleContinue} disabled={loading}>
                        <FontAwesomeIcon icon={faForward} /> Continue
                    </button>
                    <button className={PTSerifFont.className} onClick={handleRetry} disabled={loading}>
                        <FontAwesomeIcon icon={faRepeat} /> Retry
                    </button>
                    <button className={PTSerifFont.className} onClick={handleErase} disabled={loading}>
                        <FontAwesomeIcon icon={faDeleteLeft} /> Erase
                    </button>
                </div>
                )}
                </>
            ) : (
                <p className="loadingText"><FontAwesomeIcon icon={faCircleNotch} spin /> Loading...</p>
            )}
        </div>
        <div className={`settings ${settingsOpen ? 'open' : ''}`}>
            <div className="settingsHeader">
                <h3><FontAwesomeIcon icon={faGear} /> Settings</h3>
                <button onClick={() => setSettingsOpen(false)}><FontAwesomeIcon icon={faXmark} /></button>
            </div>
            
            <div>
                <label className={PTSerifFont.className}>
                    Story Title
                    <input
                        className={PTSerifFont.className}
                        type="text"
                        value={storyTitle}
                        onChange={(e) => setStoryTitle(e.target.value)}
                        placeholder="Untitled Story"
                    />
                </label>
            </div>
            <div>
                <label className={PTSerifFont.className}>
                    Plot Essentials
                    <textarea
                        className={PTSerifFont.className}
                        value={plotEssentials}
                        onChange={(e) => setPlotEssentials(e.target.value)}
                        placeholder="Important information about the adventure. The AI will always use this when generating new responses."
                    />
                </label>
            </div>
            <div>
                <label className={PTSerifFont.className}>
                    Text Speed
                    <select
                        className={PTSerifFont.className}
                        value={wordInterval === 60 ? 'Slow' : wordInterval === 30 ? 'Normal' : 'Fast'}
                        onChange={(e) => {
                            const speeds = { Slow: 60, Normal: 30, Fast: 10 };
                            setWordInterval(speeds[e.target.value]);
                        }}
                    >
                        <option value="Slow">Slow</option>
                        <option value="Normal">Normal</option>
                        <option value="Fast">Fast</option>
                    </select>
                </label>
            </div>

            <div>
                <label className={PTSerifFont.className}>
                    Response Temperature
                    <div className="sliderSetting">
                        <input type='range' min={0} max={2} step={0.05} value={responseTemperature} onChange={(e) => setResponseTemperature(e.target.value)}></input>
                        <input type='number' min={0} max={2} 
                            value={responseTemperature} 
                            onChange={(e) => setResponseTemperature(e.target.value)}
                            onBlur={(e) => {
                                let val = Number(e.target.value);
                                if (val < 0) val = 0;
                                if (val > 2) val = 2;
                                setResponseTemperature(val);
                            }}>
                        </input>
                    </div>
                </label>
            </div>
        </div>
        </>
    );
}
