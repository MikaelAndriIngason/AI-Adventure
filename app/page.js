"use client";
import styles from './styles.module.css';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faCompass, faCaretRight, faHeart } from "@fortawesome/free-solid-svg-icons";
import { useData } from './context/AdventureContext';
import { merriweather } from './lib/fonts';

import MainHeader from './components/headers/MainHeader';
import adventures from './data/adventures.json';

export default function IntroPage() {
    const router = useRouter();
    const { setData } = useData();

    // Function that starts the adventure with the given intro, title, and story essentials
    const playAdventure = (adventureId) => {
        const selectedAdventure = adventures.find(a => a.id === adventureId);

        if (selectedAdventure) {
            setData({
                intro: selectedAdventure.intro,
                title: selectedAdventure.title,
                essentials: selectedAdventure.essentials
            });
            router.push('/story');
        }
    }

    // Formats numbers higher than 999, e.g. 1000 = 1k
    const formatNumber = (num) => num > 999 ? `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k` : num;

    return (
        <>
        <MainHeader />
        <div className={`${styles.introSettings} ${styles.container}`}>
            <h3 className={merriweather.className}><FontAwesomeIcon icon={faCompass} /> Discover</h3>
            
            <h3 className={merriweather.className}>Start your first adventure</h3>

            <div className={styles.cardContainer}>
                {adventures.length > 0 ? (
                    adventures.map(adventure => (
                        <div key={adventure.id} className={styles.adventureCard}>
                            <Image width={300} height={200} src={adventure.image} alt={adventure.title} className={styles.adventureImage} />

                            <h4 className={merriweather.className}>{adventure.title}</h4>

                            <p>{adventure.description}</p>

                            <div className={styles.adventureDetails}>
                                <div className={styles.adventureStats}>
                                    <FontAwesomeIcon icon={faPlay} />
                                    <span>{formatNumber(adventure.plays)}</span>
                                </div>
                                <div className={styles.adventureStats}>
                                    <FontAwesomeIcon icon={faHeart} />
                                    <span>{formatNumber(adventure.likes)}</span>
                                </div>
                                
                                <button onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    playAdventure(adventure.id);
                                }} className={merriweather.className}>Play <FontAwesomeIcon icon={faCaretRight}/></button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No adventures available.</p>
                )}
            </div>

            {/* TODO: Enable file import functionality
            <h3 className={merriweather.className}>Already started your adventure?</h3>
            <div>
                <p>Import your adventure here: </p>
                <input type='file' accept='.json' disabled onChange={(e) => {
                    const file = e.target.files[0];
                    console.log(file);
                }} />
            </div>
            */}
        </div>
        </>
    );
}
