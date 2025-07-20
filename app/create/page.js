"use client";

import styles from '../styles.module.css';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faWandMagicSparkles, faFeatherPointed, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { merriweather, PTSerifFont } from '../lib/fonts';

import MainHeader from '../components/headers/MainHeader';

import { useData } from '../context/AdventureContext';


export default function IntroPage() {
    const router = useRouter();
    const { setData } = useData();

    const [storyTitle, setStoryTitle] = useState('');
    const [introText, setIntroText] = useState('');
    const [plotEssentials, setPlotEssentials] = useState('');
    const [loading, setLoading] = useState(false);

    // Function that starts the adventure with the given intro, title, and story essentials
    const playAdventure = () => {
        setData({
            intro: introText,
            title: storyTitle,
            essentials: plotEssentials
        });
        router.push('/story');
    }

    // Function to enhance the intro text using AI
    const enhanceIntroText = async () => {
        let payload = { intro: introText, action: 'enhanceIntro' };

        setLoading(true);

        try {
            const response = await fetch('/api/enhance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data && data.text) {
                setIntroText(data.text);
            }
        } catch (err) {
            console.error('Error generating paragraph:', err);
        }
        finally {
            setLoading(false);
        }
    }

    // Function to check if the input fields are valid
    const checkInputValidity = () => {
        if (!storyTitle.trim() || !introText.trim()) {
            return false;
        }
        return true;
    };

    return (
        <>
        <MainHeader />
        
        <div className={`${styles.introSettings} ${styles.container}`}>

            <h3 className={merriweather.className}><FontAwesomeIcon icon={faFeatherPointed} /> Create adventure</h3>
            
            <label>
                <span className={merriweather.className}>Story title <span className={styles.highlight}>*</span></span> 
                <input type="text" value={storyTitle} placeholder="Title of the story" onChange={(e) => setStoryTitle(e.target.value)} className={PTSerifFont.className} />
            </label>
            
            <div style={{ position: 'relative' }}>
                <button className={styles.enhanceButton} onClick={enhanceIntroText} disabled={loading || !introText.trim()} title='Enhance intro text'>
                    {loading ? (
                        <FontAwesomeIcon icon={faCircleNotch} spin />
                    ) : (
                        <FontAwesomeIcon icon={faWandMagicSparkles} />
                    )}
                </button>
                <label>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className={merriweather.className}>Story intro <span className={styles.highlight}>*</span></span> 
                    </div>
                    <textarea
                        rows={6}
                        value={introText}
                        className={PTSerifFont.className}
                        onChange={(e) => setIntroText(e.target.value)}
                        placeholder="Write the introduction to your story..."
                    />
                </label>
            </div>

            <label>
                <span className={merriweather.className}>Story essentials</span> 
                <textarea
                    rows={6}
                    value={plotEssentials}
                    className={PTSerifFont.className}
                    onChange={(e) => setPlotEssentials(e.target.value)}
                    placeholder="Enter important information about the adventure. The AI will always use this when generating new responses."
                />
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                    onClick={() => {
                        if (checkInputValidity()) playAdventure();
                    }}
                    disabled={!checkInputValidity()}
                    className={`${merriweather.className} filled`}
                >
                    Start Adventure <FontAwesomeIcon icon={faCaretRight} />
                </button>
            </div>
        </div>
        </>
    );
}
